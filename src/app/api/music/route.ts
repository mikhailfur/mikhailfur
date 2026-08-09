import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import tls, { type TLSSocket } from "node:tls";

export const runtime = "nodejs";

type YandexTrack = { album?: { coverUri?: string; id?: number | string }; artists?: Array<{ name?: string }>; coverUri?: string; durationMs?: number; id?: number | string; title?: string };
type PlayerState = { paused?: boolean; progressMs?: number; trackId?: string };
type MusicPresence = { artist?: string; coverUrl?: string; durationMs?: number; progressMs?: number; state: "idle" | "paused" | "playing"; title?: string; url?: string };

let presence: MusicPresence = { state: "idle" };
let watcherStarted = false;
let firstState: Promise<void> | undefined;
let resolveFirstState: (() => void) | undefined;
let watcherStatus = "not started";
let stateRevision = 0;
let missingTrackSince: number | undefined;

const PRESENCE_GRACE_MS = 45_000;

const trackRequests = new Map<string, Promise<YandexTrack | undefined>>();

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const timeout = <T,>(promise: Promise<T>, ms: number) => Promise.race<T>([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Yandex Music request timed out.")), ms))]);

class YnisonSocket {
  private buffer = Buffer.alloc(0);
  private messages: string[] = [];
  private listener: ((message: string) => void) | undefined;
  private waiter: ((message: string) => void) | undefined;

  constructor(private readonly socket: TLSSocket) {
    socket.on("data", (chunk: Buffer) => this.consume(chunk));
  }

  onMessage(listener: (message: string) => void) { this.listener = listener; }
  onClose(listener: () => void) { this.socket.once("close", listener); }
  onError(listener: (error: Error) => void) { this.socket.once("error", listener); }
  send(message: string) { this.frame(0x1, Buffer.from(message)); }
  ping() { this.frame(0x9, Buffer.alloc(0)); }
  close() { this.frame(0x8, Buffer.alloc(0)); this.socket.end(); }
  next() {
    const message = this.messages.shift();
    if (message !== undefined) return Promise.resolve(message);
    return new Promise<string>((resolve) => { this.waiter = resolve; });
  }
  consume(chunk: Buffer) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length >= 2) {
      const opcode = this.buffer[0] & 0x0f;
      let length = this.buffer[1] & 0x7f;
      let offset = 2;
      if (length === 126) { if (this.buffer.length < 4) return; length = this.buffer.readUInt16BE(2); offset = 4; }
      else if (length === 127) { if (this.buffer.length < 10) return; length = Number(this.buffer.readBigUInt64BE(2)); offset = 10; }
      if (this.buffer.length < offset + length) return;
      const payload = this.buffer.subarray(offset, offset + length);
      this.buffer = this.buffer.subarray(offset + length);
      if (opcode === 0x1) { const message = payload.toString(); if (this.waiter) { const resolve = this.waiter; this.waiter = undefined; resolve(message); } else { this.messages.push(message); } this.listener?.(message); }
      if (opcode === 0x9) this.frame(0xa, payload);
    }
  }
  private frame(opcode: number, payload: Buffer) {
    const mask = randomBytes(4);
    let header: Buffer;
    if (payload.length < 126) header = Buffer.from([0x80 | opcode, 0x80 | payload.length]);
    else if (payload.length < 65_536) { header = Buffer.alloc(4); header[0] = 0x80 | opcode; header[1] = 0xfe; header.writeUInt16BE(payload.length, 2); }
    else { header = Buffer.alloc(10); header[0] = 0x80 | opcode; header[1] = 0xff; header.writeBigUInt64BE(BigInt(payload.length), 2); }
    const body = Buffer.from(payload); for (let index = 0; index < body.length; index += 1) body[index] ^= mask[index % 4];
    this.socket.write(Buffer.concat([header, mask, body]));
  }
}

function openSocket(url: string, headers: Record<string, string>) {
  return new Promise<YnisonSocket>((resolve, reject) => {
    const target = new URL(url);
    const socket = tls.connect({ host: target.hostname, port: 443, servername: target.hostname });
    let response = Buffer.alloc(0);
    const fail = (error: Error) => reject(error);
    socket.once("error", fail);
    socket.once("secureConnect", () => {
      const key = randomBytes(16).toString("base64");
      const request = [`GET ${target.pathname} HTTP/1.1`, `Host: ${target.host}`, "Upgrade: websocket", "Connection: Upgrade", `Sec-WebSocket-Key: ${key}`, "Sec-WebSocket-Version: 13", ...Object.entries(headers).map(([name, value]) => `${name}: ${value}`), "", ""].join("\r\n");
      socket.write(request);
    });
    socket.on("data", (chunk: Buffer) => {
      response = Buffer.concat([response, chunk]);
      const end = response.indexOf("\r\n\r\n");
      if (end < 0) return;
      const status = response.subarray(0, end).toString();
      if (!status.startsWith("HTTP/1.1 101")) { socket.destroy(); reject(new Error(`Ynison handshake failed: ${status.split("\r\n")[0]}`)); return; }
      socket.removeListener("error", fail);
      socket.removeAllListeners("data");
      const client = new YnisonSocket(socket);
      const remaining = response.subarray(end + 4); if (remaining.length) client.consume(remaining);
      resolve(client);
    });
  });
}

function nextMessage(socket: YnisonSocket) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    void socket.next().then((data) => { try { resolve(JSON.parse(data)); } catch { reject(new Error("Yandex Music returned an invalid WebSocket message.")); } });
    socket.onError(reject);
  });
}

function playerState(data: Record<string, unknown>): PlayerState | null | undefined {
  const candidates = [data, data.full_state, data.update_full_state, data.ynison_state, data.state].filter((candidate): candidate is Record<string, unknown> => Boolean(candidate) && typeof candidate === "object");
  const container = candidates.find((candidate) => "player_state" in candidate);
  if (!container) return undefined;
  const state = container.player_state as { player_queue?: { current_playable_index?: number; playable_list?: Array<{ playable_id?: string; id?: string }> }; status?: { paused?: boolean; progress_ms?: number } } | undefined;
  const queue = state?.player_queue;
  const index = queue?.current_playable_index;
  const playable = typeof index === "number" ? queue?.playable_list?.[index] : undefined;
  const playableId = playable?.playable_id ?? playable?.id;
  const trackId = playableId?.match(/(?:track[:/])(\d+)/)?.[1] ?? playableId?.match(/(\d+)$/)?.[1];
  const progressMs = Number(state?.status?.progress_ms);
  return trackId ? { trackId, paused: state?.status?.paused, progressMs: Number.isFinite(progressMs) ? progressMs : undefined } : null;
}

function coverUrl(uri?: string) {
  return uri ? `https://${uri.replace("%%", "300x300")}` : undefined;
}

async function updatePresence(token: string, state?: PlayerState | null) {
  if (!state?.trackId) {
    // Ynison can briefly publish an empty queue while it synchronizes a real player.
    // Keep the last confirmed track until the empty state has persisted long enough.
    missingTrackSince ??= Date.now();
    if (presence.state === "idle") {
      resolveFirstState?.();
      resolveFirstState = undefined;
    }
    return;
  }

  const revision = ++stateRevision;
  missingTrackSince = undefined;
  resolveFirstState?.();
  resolveFirstState = undefined;

  let request = trackRequests.get(state.trackId);
  if (!request) {
    request = fetch(`https://api.music.yandex.net/tracks/${state.trackId}`, { headers: { Authorization: `OAuth ${token}` }, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load track details.");
        return (await response.json()).result?.[0] as YandexTrack | undefined;
      })
      .catch((error: unknown) => {
        trackRequests.delete(state.trackId!);
        throw error;
      });
    trackRequests.set(state.trackId, request);
  }
  const track = await request;
  if (!track?.title) throw new Error("Yandex Music track is unavailable.");
  // Metadata requests can finish out of order; do not replace newer playback position.
  if (revision !== stateRevision) return;
  const artist = track.artists?.map(({ name }) => name).filter(Boolean).join(", ") ?? "Unknown artist";
  const albumId = track.album?.id;
  presence = { state: state.paused ? "paused" : "playing", title: track.title, artist, coverUrl: coverUrl(track.coverUri ?? track.album?.coverUri), url: albumId && track.id ? `https://music.yandex.ru/album/${albumId}/track/${track.id}` : undefined, progressMs: state.progressMs, durationMs: track.durationMs };
}

async function watchYnison(token: string) {
  const deviceId = Array.from({ length: 16 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  const protocol = { "Ynison-Device-Id": deviceId, "Ynison-Device-Info": JSON.stringify({ app_name: "MKH_LOG", type: 1 }) };
  const headers = { Authorization: `OAuth ${token}`, Origin: "http://music.yandex.ru", "Sec-WebSocket-Protocol": `Bearer, v2, ${JSON.stringify(protocol)}` };
  const redirect = await timeout(openSocket("wss://ynison.music.yandex.ru/redirector.YnisonRedirectService/GetRedirectToYnison", headers), 10_000);
  try {
    const location = await timeout(nextMessage(redirect), 10_000) as { host?: string; redirect_ticket?: string };
    if (!location.host || !location.redirect_ticket) throw new Error("Ynison redirect is unavailable.");
    const sessionProtocol = { ...protocol, "Ynison-Redirect-Ticket": location.redirect_ticket };
    const sessionHeaders = { Authorization: `OAuth ${token}`, Origin: "http://music.yandex.ru", "Sec-WebSocket-Protocol": `Bearer, v2, ${JSON.stringify(sessionProtocol)}` };
    const session = await timeout(openSocket(`wss://${location.host}/ynison_state.YnisonStateService/PutYnisonState`, sessionHeaders), 10_000);
    try {
      watcherStatus = "connected; waiting for player state";
      session.send(JSON.stringify({ update_full_state: { player_state: { player_queue: { current_playable_index: -1, entity_id: "", entity_type: "VARIOUS", playable_list: [], options: { repeat_mode: "NONE" }, entity_context: "BASED_ON_ENTITY_BY_DEFAULT", version: { device_id: deviceId, version: 0, timestamp_ms: 0 }, from_optional: "" }, status: { duration_ms: 0, paused: true, playback_speed: 1, progress_ms: 0, version: { device_id: deviceId, version: 0, timestamp_ms: 0 } } }, device: { capabilities: { can_be_player: true, can_be_remote_controller: false, volume_granularity: 16 }, info: { device_id: deviceId, type: "WEB", title: "MKH_LOG", app_name: "MKH_LOG" }, volume_info: { volume: 0 }, is_shadow: true }, is_currently_active: false }, rid: deviceId, player_action_timestamp_ms: 0, activity_interception_type: "DO_NOT_INTERCEPT_BY_DEFAULT" }));
      const ping = setInterval(() => session.ping(), 25_000);
      try {
        await new Promise<void>((resolve, reject) => {
        session.onMessage((data) => {
          try {
            const state = playerState(JSON.parse(data));
            if (state !== undefined) {
              watcherStatus = state?.trackId ? "received player track" : "received idle player state";
              void updatePresence(token, state).catch(() => { watcherStatus = "could not load track metadata"; });
            }
          } catch { /* Ignore malformed or non-state messages from the stream. */ }
          });
        session.onClose(resolve);
        session.onError(reject);
        });
      } finally { clearInterval(ping); }
    } finally { session.close(); }
  } finally { redirect.close(); }
}

function startWatcher(token: string) {
  if (watcherStarted) return;
  watcherStarted = true;
  firstState = new Promise<void>((resolve) => { resolveFirstState = resolve; });
  void (async () => {
    while (true) {
      try { await watchYnison(token); } catch (error) { watcherStatus = `connection failed: ${error instanceof Error ? error.message : "unknown error"}`; resolveFirstState?.(); resolveFirstState = undefined; }
      await wait(2_000);
    }
  })();
}

export async function GET() {
  const token = process.env.YANDEX_MUSIC_TOKEN;
  if (!token) return NextResponse.json({ state: "unconfigured" });
  startWatcher(token);
  if (firstState) await Promise.race([firstState, wait(2_500)]);
  const effectivePresence = missingTrackSince && Date.now() - missingTrackSince > PRESENCE_GRACE_MS
    ? { state: "idle" as const }
    : presence;
  return NextResponse.json(process.env.NODE_ENV === "production" ? effectivePresence : { ...effectivePresence, diagnostic: watcherStatus }, { headers: { "Cache-Control": "no-store" } });
}
