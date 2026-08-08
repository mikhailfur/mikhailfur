import { NextRequest, NextResponse } from "next/server";
import { approveAuthSessionByCode, getAuthSessionByCode, sendTelegramMessage } from "@/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callbackQuery = body.callback_query;

    if (!callbackQuery) {
      return NextResponse.json({ ok: true });
    }

    const data = callbackQuery.data as string;
    const token = process.env.TELEGRAM_BOT_TOKEN;

    // Answer callback query so Telegram UI removes loading spinner
    if (token && callbackQuery.id) {
      fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: "Action processed!",
        }),
      }).catch(() => {});
    }

    if (data.startsWith("auth_approve_")) {
      const code = data.replace("auth_approve_", "");
      const adminToken = `adm_${Math.random().toString(36).substring(2, 14)}_${Date.now().toString(36)}`;
      const session = approveAuthSessionByCode(code, adminToken);

      if (session) {
        void sendTelegramMessage(
          `✅ <b>AUTHORIZATION GRANTED!</b>\n\nCode <code>${code}</code> has been authorized. The website login session is now unlocked!`
        );
      } else {
        void sendTelegramMessage(`⚠️ Verification code <code>${code}</code> expired or not found.`);
      }
    } else if (data.startsWith("auth_reject_")) {
      const code = data.replace("auth_reject_", "");
      const session = getAuthSessionByCode(code);
      if (session) {
        session.status = "rejected";
      }
      void sendTelegramMessage(`❌ <b>AUTHORIZATION REJECTED!</b>\n\nCode <code>${code}</code> was denied.`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
