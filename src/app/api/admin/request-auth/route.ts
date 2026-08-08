import { NextRequest, NextResponse } from "next/server";
import { createAuthSession, getRecentPendingAuthSession, sendTelegramMessage } from "@/store";

function generateVerificationCode(): string {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${p1}-${p2}`;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

async function fetchGeoIp(ip: string): Promise<string> {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "Localhost / Internal Network";
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === "success") {
        return `${data.city || ""}, ${data.country || ""} (${data.isp || ""})`.trim().replace(/^,\s*/, "");
      }
    }
  } catch {
    // Geo IP lookup fallback
  }
  return "Unknown Location";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "Unknown Device";
    const geo = await fetchGeoIp(ip);

    // Reuse recent pending session if created in last 60 seconds (prevents double Telegram alerts)
    const existingSession = getRecentPendingAuthSession(ip);
    if (existingSession) {
      return NextResponse.json({
        success: true,
        sessionId: existingSession.sessionId,
        code: existingSession.code,
        ip: existingSession.ip,
        userAgent: existingSession.userAgent,
        geo: existingSession.geo,
        telegramSent: true,
        reused: true,
      });
    }

    const code = generateVerificationCode(); // e.g. 83F1-A92B
    const sessionId = `sess_${Math.random().toString(36).substring(2, 10)}`;

    createAuthSession({
      sessionId,
      code,
      ip,
      userAgent,
      geo,
      status: "pending",
      createdAt: Date.now(),
    });

    const telegramText = [
      `🔐 <b>ADMIN LOGIN AUTHORIZATION REQUEST</b>`,
      `----------------------------------------`,
      `🔑 <b>Verification Code:</b> <code>${code}</code>`,
      `🌐 <b>IP Address:</b> <code>${ip}</code>`,
      `📍 <b>Location:</b> ${geo}`,
      `💻 <b>Device / User-Agent:</b>`,
      `<code>${userAgent}</code>`,
      `----------------------------------------`,
      `<i>Please verify that the 8-character code matches the code displayed on your website login screen.</i>`,
    ].join("\n");

    const inlineKeyboard = [
      [
        { text: `✅ Authorize (${code})`, callback_data: `auth_approve_${code}` },
        { text: `❌ Decline`, callback_data: `auth_reject_${code}` },
      ],
    ];

    const sent = await sendTelegramMessage(telegramText, inlineKeyboard);

    return NextResponse.json({
      success: true,
      sessionId,
      code,
      ip,
      userAgent,
      geo,
      telegramSent: sent,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to initiate admin auth request." }, { status: 500 });
  }
}
