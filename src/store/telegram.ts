export type TelegramInlineKeyboardButton = {
  text: string;
  url?: string;
  callback_data?: string;
};

export async function sendTelegramMessage(
  text: string,
  replyMarkupKeyboard?: TelegramInlineKeyboardButton[][]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram bot token or chat ID is missing. Message skipped.");
    return false;
  }

  try {
    const payload: {
      chat_id: string;
      text: string;
      parse_mode: string;
      reply_markup?: { inline_keyboard: TelegramInlineKeyboardButton[][] };
    } = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    };

    if (replyMarkupKeyboard) {
      payload.reply_markup = {
        inline_keyboard: replyMarkupKeyboard,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Telegram API error:", errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return false;
  }
}

export async function sendTelegramFile(
  fileBuffer: Buffer | Uint8Array,
  filename: string,
  caption?: string,
  replyMarkupKeyboard?: TelegramInlineKeyboardButton[][]
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram bot token or chat ID is missing. File upload skipped.");
    return false;
  }

  try {
    const isImage = /\.(png|jpe?g)$/i.test(filename);
    const endpoint = isImage ? "sendPhoto" : "sendDocument";
    const fieldName = isImage ? "photo" : "document";

    const blob = new Blob([Buffer.from(fileBuffer)]);

    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append(fieldName, blob, filename);

    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");
    }

    if (replyMarkupKeyboard) {
      formData.append("reply_markup", JSON.stringify({ inline_keyboard: replyMarkupKeyboard }));
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Telegram file upload error:", errData);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Failed to send Telegram file:", err);
    return false;
  }
}
