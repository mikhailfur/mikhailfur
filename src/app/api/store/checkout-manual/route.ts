import { NextRequest, NextResponse } from "next/server";
import { getProductById, saveOrder, sendTelegramFile, sendTelegramMessage, StoreOrder } from "@/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const paymentMethod = formData.get("paymentMethod") as "korean_bank" | "kazakh_sbp";
    const receiptFile = formData.get("receipt") as File | null;

    if (!productId || !customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Product ID and valid email are required." }, { status: 400 });
    }

    if (!receiptFile) {
      return NextResponse.json({ error: "Payment receipt attachment (PNG/JPG/JPEG/PDF) is required." }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const arrayBuffer = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = receiptFile.name || "receipt.png";
    const mimeType = receiptFile.type || "image/png";

    // Store base64 data URL for preview in Admin panel
    const base64Data = buffer.toString("base64");
    const receiptDataUrl = `data:${mimeType};base64,${base64Data}`;

    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newOrder: StoreOrder = {
      orderId,
      productId: product.id,
      productTitle: product.title,
      amount: product.price,
      currency: "USD",
      customerEmail,
      paymentMethod,
      paymentStatus: "pending",
      receiptFilename: fileName,
      receiptDataUrl,
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);

    const methodNameText = paymentMethod === "korean_bank"
      ? "🇰🇷 Korean Bank Account Transfer (한국 계좌 이체)"
      : "🇰🇿 Kazakh Phone SBP / Card (Казахстан СБП/Карта)";

    const caption = [
      `💳 <b>MANUAL PAYMENT RECEIPT SUBMITTED</b>`,
      `----------------------------------------`,
      `📦 <b>Product:</b> ${product.title}`,
      `💰 <b>Amount:</b> $${product.price.toFixed(2)} USD`,
      `📧 <b>Email:</b> <code>${customerEmail}</code>`,
      `🏦 <b>Method:</b> ${methodNameText}`,
      `🆔 <b>Order ID:</b> <code>${orderId}</code>`,
      `----------------------------------------`,
      `<i>Please verify payment receipt attachment and fulfill via Resend email in /admin.</i>`,
    ].join("\n");

    const inlineButtons = [
      [
        { text: `✅ Fulfill Order ${orderId}`, callback_data: `fulfill_${orderId}` },
        { text: `❌ Reject`, callback_data: `reject_${orderId}` },
      ],
    ];

    // Send file to Telegram Admin Bot
    const fileSent = await sendTelegramFile(buffer, fileName, caption, inlineButtons);
    if (!fileSent) {
      // Fallback text notification if file upload fails
      void sendTelegramMessage(caption, inlineButtons);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order placed. Receipt sent to Telegram for manual verification.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Manual checkout failed." }, { status: 500 });
  }
}
