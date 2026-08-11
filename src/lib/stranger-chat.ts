import { Redis } from "@upstash/redis";

type ChatStatus = "pending" | "waiting" | "connected" | "disconnected" | "left";

type ChatSession = {
  id: string;
  token: string;
  nickname: string;
  status: ChatStatus;
  roomId?: string;
  partnerId?: string;
  partnerNickname?: string;
  lastSeen: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  nickname: string;
  text: string;
  createdAt: number;
};

type ChatInput = {
  action?: string;
  nickname?: string;
  sessionId?: string;
  token?: string;
  text?: string;
};

type MemoryStore = {
  sessions: Map<string, ChatSession>;
  queue: string[];
  messages: Map<string, ChatMessage[]>;
  limits: Map<string, { count: number; expiresAt: number }>;
  reports: Map<string, { messages: ChatMessage[]; createdAt: number }>;
};

const QUEUE_KEY = "stranger-chat:queue:v1";
const SESSION_TTL_SECONDS = 60 * 60;
const ROOM_TTL_SECONDS = 60 * 60;
const WAITING_STALE_MS = 75_000;
const PARTNER_STALE_MS = 75_000;
const MAX_MESSAGES_PER_MINUTE = 18;

const MATCH_SESSION_SCRIPT = `
local currentRaw = redis.call('GET', KEYS[2])
if not currentRaw then return nil end
local current = cjson.decode(currentRaw)
if current.token ~= ARGV[1] or current.status ~= 'waiting' then return currentRaw end
redis.call('ZREMRANGEBYSCORE', KEYS[1], 0, ARGV[3])
for attempt = 1, 6 do
  local popped = redis.call('ZPOPMIN', KEYS[1], 1)
  local candidateId = popped[1]
  if not candidateId then break end
  if candidateId ~= current.id then
    local candidateKey = ARGV[7] .. candidateId
    local candidateRaw = redis.call('GET', candidateKey)
    if candidateRaw then
      local candidate = cjson.decode(candidateRaw)
      if candidate.status == 'waiting' and tonumber(ARGV[2]) - tonumber(candidate.lastSeen) <= tonumber(ARGV[4]) then
        current.status = 'connected'
        current.roomId = ARGV[5]
        current.partnerId = candidate.id
        current.partnerNickname = candidate.nickname
        current.lastSeen = tonumber(ARGV[2])
        candidate.status = 'connected'
        candidate.roomId = ARGV[5]
        candidate.partnerId = current.id
        candidate.partnerNickname = current.nickname
        candidate.lastSeen = tonumber(ARGV[2])
        redis.call('SET', KEYS[2], cjson.encode(current), 'EX', ARGV[6])
        redis.call('SET', candidateKey, cjson.encode(candidate), 'EX', ARGV[6])
        return cjson.encode(current)
      end
    end
  end
end
current.lastSeen = tonumber(ARGV[2])
redis.call('SET', KEYS[2], cjson.encode(current), 'EX', ARGV[6])
redis.call('ZADD', KEYS[1], ARGV[2], current.id)
return cjson.encode(current)
`;

const REFRESH_SESSION_SCRIPT = `
local raw = redis.call('GET', KEYS[2])
if not raw then return nil end
local session = cjson.decode(raw)
if session.token ~= ARGV[1] then return nil end
session.lastSeen = tonumber(ARGV[2])
redis.call('SET', KEYS[2], cjson.encode(session), 'EX', ARGV[3])
if session.status == 'waiting' then redis.call('ZADD', KEYS[1], ARGV[2], session.id) end
return cjson.encode(session)
`;

const LEAVE_SESSION_SCRIPT = `
local raw = redis.call('GET', KEYS[2])
if not raw then return nil end
local session = cjson.decode(raw)
if session.token ~= ARGV[1] then return nil end
redis.call('ZREM', KEYS[1], session.id)
if session.partnerId then
  local partnerKey = ARGV[4] .. session.partnerId
  local partnerRaw = redis.call('GET', partnerKey)
  if partnerRaw then
    local partner = cjson.decode(partnerRaw)
    if partner.status == 'connected' and partner.partnerId == session.id then
      partner.status = 'disconnected'
      redis.call('SET', partnerKey, cjson.encode(partner), 'EX', ARGV[3])
    end
  end
end
session.status = 'left'
session.token = ''
session.lastSeen = tonumber(ARGV[2])
redis.call('SET', KEYS[2], cjson.encode(session), 'EX', ARGV[3])
return cjson.encode(session)
`;

const DISCONNECT_SESSION_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return nil end
local session = cjson.decode(raw)
if session.token ~= ARGV[1] then return nil end
if session.status == 'connected' then session.status = 'disconnected' end
redis.call('SET', KEYS[1], cjson.encode(session), 'EX', ARGV[2])
return cjson.encode(session)
`;

const globalStore = globalThis as typeof globalThis & { __strangerChatMemory?: MemoryStore };

function memoryStore() {
  globalStore.__strangerChatMemory ??= {
    sessions: new Map(),
    queue: [],
    messages: new Map(),
    limits: new Map(),
    reports: new Map(),
  };
  return globalStore.__strangerChatMemory;
}

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

function sessionKey(id: string) {
  return `stranger-chat:session:${id}`;
}

function roomKey(id: string) {
  return `stranger-chat:room:${id}:messages`;
}

function sessionFromResult(result: ChatSession | string | null) {
  if (!result) return null;
  return typeof result === "string" ? JSON.parse(result) as ChatSession : result;
}

function cleanNickname(value: unknown) {
  const nickname = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!/^[\p{L}\p{N}_.\- ]{2,20}$/u.test(nickname)) {
    throw new ChatError("NICKNAME_INVALID", "Nickname must contain 2-20 letters, numbers, spaces, dots, dashes, or underscores.", 400);
  }
  return nickname;
}

function cleanMessage(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text.length > 500 || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
    throw new ChatError("MESSAGE_INVALID", "Message must contain 1-500 printable characters.", 400);
  }
  return text;
}

export class ChatError extends Error {
  constructor(public code: string, message: string, public status: number) {
    super(message);
  }
}

function publicSession(session: ChatSession, messages: ChatMessage[] = []) {
  return {
    sessionId: session.id,
    token: session.token,
    status: session.status,
    nickname: session.nickname,
    partnerNickname: session.partnerNickname,
    messages,
  };
}

async function createSession(nickname: string) {
  const session: ChatSession = {
    id: crypto.randomUUID(),
    token: `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", ""),
    nickname,
    status: "pending",
    lastSeen: Date.now(),
  };
  const redis = getRedis();
  if (redis) await redis.set(sessionKey(session.id), session, { ex: SESSION_TTL_SECONDS });
  else memoryStore().sessions.set(session.id, session);
  return session;
}

async function readSession(id: string) {
  const redis = getRedis();
  return redis ? redis.get<ChatSession>(sessionKey(id)) : memoryStore().sessions.get(id) ?? null;
}

async function saveSession(session: ChatSession) {
  const redis = getRedis();
  if (redis) await redis.set(sessionKey(session.id), session, { ex: SESSION_TTL_SECONDS });
  else memoryStore().sessions.set(session.id, session);
}

async function authenticatedSession(input: ChatInput) {
  if (!input.sessionId || !input.token) throw new ChatError("SESSION_REQUIRED", "Chat session is required.", 401);
  const session = await readSession(input.sessionId);
  if (!session || session.token !== input.token) throw new ChatError("SESSION_EXPIRED", "Chat session has expired.", 401);
  return session;
}

async function pairOrQueue(session: ChatSession) {
  const redis = getRedis();
  if (redis) {
    const now = Date.now();
    const result = await redis.eval<string[], ChatSession | string>(
      MATCH_SESSION_SCRIPT,
      [QUEUE_KEY, sessionKey(session.id)],
      [session.token, String(now), String(now - WAITING_STALE_MS), String(WAITING_STALE_MS), crypto.randomUUID(), String(SESSION_TTL_SECONDS), "stranger-chat:session:"],
    );
    return sessionFromResult(result) ?? session;
  }

  const store = memoryStore();
  store.queue = store.queue.filter((id) => {
    const item = store.sessions.get(id);
    return item && item.status === "waiting" && Date.now() - item.lastSeen <= WAITING_STALE_MS;
  });
  const candidateId = store.queue.shift();
  if (!candidateId) {
    store.queue.push(session.id);
    return session;
  }
  const candidate = store.sessions.get(candidateId);
  if (!candidate) {
    store.queue.push(session.id);
    return session;
  }
  const roomId = crypto.randomUUID();
  const connectedAt = Date.now();
  const nextSession = { ...session, status: "connected" as const, roomId, partnerId: candidate.id, partnerNickname: candidate.nickname, lastSeen: connectedAt };
  const nextCandidate = { ...candidate, status: "connected" as const, roomId, partnerId: session.id, partnerNickname: session.nickname, lastSeen: connectedAt };
  store.sessions.set(nextSession.id, nextSession);
  store.sessions.set(nextCandidate.id, nextCandidate);
  return nextSession;
}

async function refreshSession(session: ChatSession) {
  const redis = getRedis();
  if (redis) {
    const result = await redis.eval<string[], ChatSession | string>(
      REFRESH_SESSION_SCRIPT,
      [QUEUE_KEY, sessionKey(session.id)],
      [session.token, String(Date.now()), String(SESSION_TTL_SECONDS)],
    );
    const refreshed = sessionFromResult(result);
    if (!refreshed) throw new ChatError("SESSION_EXPIRED", "Chat session has expired.", 401);
    return refreshed;
  }
  const current = memoryStore().sessions.get(session.id);
  if (!current || current.token !== session.token) throw new ChatError("SESSION_EXPIRED", "Chat session has expired.", 401);
  const refreshed = { ...current, lastSeen: Date.now() };
  memoryStore().sessions.set(refreshed.id, refreshed);
  if (refreshed.status === "waiting" && !memoryStore().queue.includes(refreshed.id)) memoryStore().queue.push(refreshed.id);
  return refreshed;
}

async function disconnectSession(session: ChatSession) {
  const redis = getRedis();
  if (redis) {
    const result = await redis.eval<string[], ChatSession | string>(
      DISCONNECT_SESSION_SCRIPT,
      [sessionKey(session.id)],
      [session.token, String(SESSION_TTL_SECONDS)],
    );
    const disconnected = sessionFromResult(result);
    if (!disconnected) throw new ChatError("SESSION_EXPIRED", "Chat session has expired.", 401);
    return disconnected;
  }
  const current = memoryStore().sessions.get(session.id);
  if (!current || current.token !== session.token) throw new ChatError("SESSION_EXPIRED", "Chat session has expired.", 401);
  const disconnected = current.status === "connected" ? { ...current, status: "disconnected" as const } : current;
  memoryStore().sessions.set(disconnected.id, disconnected);
  return disconnected;
}

async function readMessages(roomId?: string) {
  if (!roomId) return [];
  const redis = getRedis();
  return redis ? redis.lrange<ChatMessage>(roomKey(roomId), 0, 99) : memoryStore().messages.get(roomId) ?? [];
}

async function leaveSession(session: ChatSession) {
  const redis = getRedis();
  if (redis) {
    const result = await redis.eval<string[], ChatSession | string>(
      LEAVE_SESSION_SCRIPT,
      [QUEUE_KEY, sessionKey(session.id)],
      [session.token, String(Date.now()), String(SESSION_TTL_SECONDS), "stranger-chat:session:"],
    );
    return sessionFromResult(result) ?? { ...session, status: "left" as const, token: "" };
  }
  memoryStore().queue = memoryStore().queue.filter((id) => id !== session.id);
  const nextSession = { ...session, status: "left" as const, token: "", lastSeen: Date.now() };
  memoryStore().sessions.set(nextSession.id, nextSession);
  if (!session.partnerId) return nextSession;
  const partner = await readSession(session.partnerId);
  if (partner && partner.status === "connected" && partner.partnerId === session.id) {
    await saveSession({ ...partner, status: "disconnected", lastSeen: Date.now() });
  }
  return nextSession;
}

async function checkMessageLimit(sessionId: string) {
  const redis = getRedis();
  const key = `stranger-chat:limit:${sessionId}:${Math.floor(Date.now() / 60_000)}`;
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 70);
    if (count > MAX_MESSAGES_PER_MINUTE) throw new ChatError("RATE_LIMITED", "Too many messages. Wait a moment.", 429);
    return;
  }
  const store = memoryStore();
  const current = store.limits.get(key);
  const next = !current || current.expiresAt < Date.now() ? { count: 1, expiresAt: Date.now() + 70_000 } : { ...current, count: current.count + 1 };
  store.limits.set(key, next);
  if (next.count > MAX_MESSAGES_PER_MINUTE) throw new ChatError("RATE_LIMITED", "Too many messages. Wait a moment.", 429);
}

async function checkActionLimit(sessionId: string) {
  const key = `stranger-chat:actions:${sessionId}:${Math.floor(Date.now() / 60_000)}`;
  const redis = getRedis();
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 70);
    if (count > 90) throw new ChatError("RATE_LIMITED", "Too many chat requests.", 429);
    return;
  }
  const store = memoryStore();
  const current = store.limits.get(key);
  const next = !current || current.expiresAt < Date.now() ? { count: 1, expiresAt: Date.now() + 70_000 } : { ...current, count: current.count + 1 };
  store.limits.set(key, next);
  if (next.count > 90) throw new ChatError("RATE_LIMITED", "Too many chat requests.", 429);
}

export function chatBackendAvailable() {
  return Boolean(getRedis()) || process.env.NODE_ENV !== "production";
}

export async function handleChatAction(input: ChatInput, fingerprint: string) {
  if (!chatBackendAvailable()) throw new ChatError("CHAT_UNAVAILABLE", "Shared Redis storage is not configured.", 503);

  if (input.action === "join") {
    const redis = getRedis();
    if (redis) {
      const key = `stranger-chat:joins:${fingerprint}:${Math.floor(Date.now() / 3_600_000)}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 3_700);
      if (count > 24) throw new ChatError("RATE_LIMITED", "Too many new chat sessions.", 429);
    }
    const session = await createSession(cleanNickname(input.nickname));
    return publicSession(session);
  }

  const session = await authenticatedSession(input);
  if (input.action === "leave") {
    await leaveSession(session);
    return { ok: true, status: "left" };
  }
  await checkActionLimit(session.id);

  if (input.action === "activate") {
    if (session.status !== "pending") throw new ChatError("SESSION_ACTIVE", "Chat session is already active.", 409);
    const waiting = { ...session, status: "waiting" as const, lastSeen: Date.now() };
    await saveSession(waiting);
    return publicSession(await pairOrQueue(waiting));
  }

  if (input.action === "status") {
    let current = await refreshSession(session);
    if (current.status === "connected" && current.partnerId) {
      const partner = await readSession(current.partnerId);
      if (!partner || partner.status !== "connected" || Date.now() - partner.lastSeen > PARTNER_STALE_MS) {
        current = await disconnectSession(current);
      }
      return publicSession(current, await readMessages(current.roomId));
    }
    return publicSession(current, await readMessages(current.roomId));
  }

  if (input.action === "message") {
    const current = await refreshSession(session);
    if (current.status !== "connected" || !current.roomId) throw new ChatError("NOT_CONNECTED", "No stranger is connected.", 409);
    const partner = current.partnerId ? await readSession(current.partnerId) : null;
    if (!partner || partner.status !== "connected" || partner.partnerId !== current.id || Date.now() - partner.lastSeen > PARTNER_STALE_MS) {
      await disconnectSession(current);
      throw new ChatError("NOT_CONNECTED", "No stranger is connected.", 409);
    }
    await checkMessageLimit(current.id);
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: current.id,
      nickname: current.nickname,
      text: cleanMessage(input.text),
      createdAt: Date.now(),
    };
    const redis = getRedis();
    if (redis) {
      await redis.multi()
        .rpush(roomKey(current.roomId), message)
        .ltrim(roomKey(current.roomId), -100, -1)
        .expire(roomKey(current.roomId), ROOM_TTL_SECONDS)
        .exec();
    } else {
      const messages = [...(memoryStore().messages.get(current.roomId) ?? []), message].slice(-100);
      memoryStore().messages.set(current.roomId, messages);
    }
    return { ok: true, message };
  }

  if (input.action === "report") {
    const current = await refreshSession(session);
    if (current.status !== "connected" || !current.partnerId || !current.roomId) {
      throw new ChatError("NOT_CONNECTED", "No connected stranger can be reported.", 409);
    }
    const messages = await readMessages(current.roomId);
    const reportId = `${current.id}:${current.roomId}`;
    const redis = getRedis();
    if (redis) {
      await redis.set(`stranger-chat:report:${reportId}`, {
        roomId: current.roomId,
        reportedSessionId: current.partnerId,
        messages,
        createdAt: Date.now(),
      }, { ex: 60 * 60 * 24 * 7, nx: true });
    } else if (!memoryStore().reports.has(reportId)) {
      memoryStore().reports.set(reportId, { messages, createdAt: Date.now() });
    }
    await leaveSession(current);
    return { ok: true, status: "left" };
  }

  throw new ChatError("ACTION_INVALID", "Unknown chat action.", 400);
}
