import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const maxMessageLength = 2_000;
const rateLimitWindow = 10 * 60 * 1_000;
const maxMessagesPerWindow = 5;
const requestLog = new Map<string, number[]>();

function clientKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const requests = (requestLog.get(key) ?? []).filter((time) => now - time < rateLimitWindow);
  if (requests.length >= maxMessagesPerWindow) {
    requestLog.set(key, requests);
    return true;
  }
  requests.push(now);
  requestLog.set(key, requests);
  return false;
}

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ error: "Message delivery is not configured." }, { status: 503 });
  if (isRateLimited(clientKey(request))) return NextResponse.json({ error: "Too many messages." }, { status: 429 });

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof message !== "string") return NextResponse.json({ error: "Message must be text." }, { status: 400 });
  const text = message.trim();
  if (!text || text.length > maxMessageLength) return NextResponse.json({ error: "Message length is invalid." }, { status: 400 });

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: `New portfolio message:\n\n${text}`, disable_web_page_preview: true }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Telegram rejected the message." }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Message delivery failed." }, { status: 502 });
  }

  return NextResponse.json({ sent: true }, { headers: { "Cache-Control": "no-store" } });
}
