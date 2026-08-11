import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { ChatError, handleChatAction } from "@/lib/stranger-chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function requestFingerprint(request: NextRequest) {
  let ip = "local";
  if (process.env.VERCEL) ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  else if (process.env.CF_PAGES) ip = request.headers.get("cf-connecting-ip") || "unknown";
  else if (process.env.NODE_ENV === "production") ip = "direct";
  else ip = request.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ error: "ORIGIN_INVALID", message: "Cross-origin chat requests are not allowed." }, { status: 403 });
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return Response.json({ error: "CONTENT_TYPE_INVALID", message: "Expected an application/json request." }, { status: 415 });
    }
    const input = await request.json();
    const result = await handleChatAction(input, requestFingerprint(request));
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ChatError) {
      return Response.json({ error: error.code, message: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    }
    console.error("Stranger chat request failed", error);
    return Response.json({ error: "CHAT_ERROR", message: "Chat service failed." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
