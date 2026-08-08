import { NextRequest, NextResponse } from "next/server";
import { approveAuthSessionByCode, getAuthSession, getAuthSessionByCode, isValidAdminToken } from "@/store";

export const runtime = "nodejs";

async function checkTelegramUpdatesForApproval(code: string): Promise<string | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-10`, {
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.result)) return null;

    const cleanTargetCode = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    for (const update of data.result) {
      const cb = update.callback_query;
      if (cb && typeof cb.data === "string") {
        if (cb.data.startsWith("auth_approve_")) {
          const cbCode = cb.data.replace("auth_approve_", "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
          if (cbCode === cleanTargetCode) {
            // Answer callback query so spinner stops in Telegram
            fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ callback_query_id: cb.id, text: "Authorization Granted!" }),
            }).catch(() => {});

            const adminToken = `adm_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
            const session = await approveAuthSessionByCode(code, adminToken);
            if (session) {
              return adminToken;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("Telegram getUpdates check error:", err);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const code = searchParams.get("code");

  // Check if existing session token in cookie/header is already valid
  const currentToken = request.headers.get("x-admin-token") || request.cookies.get("admin_token")?.value;
  if (currentToken && (await isValidAdminToken(currentToken))) {
    return NextResponse.json({ approved: true, token: currentToken });
  }

  if (!sessionId && !code) {
    return NextResponse.json({ approved: false, error: "Session ID or code is required." }, { status: 400 });
  }

  const session = sessionId ? await getAuthSession(sessionId) : await getAuthSessionByCode(code!);
  if (!session) {
    return NextResponse.json({ approved: false, error: "Session not found." }, { status: 404 });
  }

  // If already approved
  if (session.status === "approved" && session.token) {
    const response = NextResponse.json({ approved: true, token: session.token });
    response.cookies.set("admin_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return response;
  }

  // If pending, check Telegram getUpdates as fallback for Environments where Webhook is not registered (e.g. localhost)
  if (session.status === "pending") {
    const approvedToken = await checkTelegramUpdatesForApproval(session.code);
    if (approvedToken) {
      const response = NextResponse.json({ approved: true, token: approvedToken });
      response.cookies.set("admin_token", approvedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    }
  }

  return NextResponse.json({ approved: false, status: session.status });
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
    }

    const token = `adm_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
    const session = await approveAuthSessionByCode(code, token);

    if (!session) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, token });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication error." }, { status: 500 });
  }
}
