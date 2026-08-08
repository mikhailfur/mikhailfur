import { NextRequest, NextResponse } from "next/server";
import { generate2328Signature, getOrderById, saveOrder, sendTelegramMessage } from "@/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const headersSign = request.headers.get("sign");
    const apiKey = process.env.PAY2328_API_KEY;

    let bodyData: any;
    try {
      bodyData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Verify HMAC signature if API key configured
    if (apiKey && headersSign) {
      const computedSign = generate2328Signature(bodyData, apiKey);
      if (computedSign.toLowerCase() !== headersSign.toLowerCase()) {
        console.warn("2328.io webhook signature mismatch:", { computedSign, headersSign });
      }
    }

    const { order_id, payment_status, uuid, txid } = bodyData;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const order = getOrderById(order_id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Status mapping
    if (payment_status === "paid" || payment_status === "overpaid") {
      order.paymentStatus = "paid";
      if (uuid) order.pay2328Uuid = uuid;
      saveOrder(order);

      // Send Telegram notification to admin for manual fulfillment!
      const telegramText = [
        `💰 <b>2328.io CRYPTO PAYMENT RECEIVED!</b>`,
        `----------------------------------------`,
        `🛒 <b>Order ID:</b> <code>#${order.orderId}</code>`,
        `📦 <b>Product:</b> ${order.productTitle}`,
        `💵 <b>Amount:</b> $${order.amount.toFixed(2)} USD`,
        `📧 <b>Buyer Email:</b> <code>${order.customerEmail}</code>`,
        `🔗 <b>TXID:</b> <code>${txid || "Confirmed"}</code>`,
        `----------------------------------------`,
        `⚠️ <i>Item delivery is MANUAL. Open /admin to fulfill via Resend email.</i>`,
      ].join("\n");

      void sendTelegramMessage(telegramText);
    } else if (payment_status === "fail" || payment_status === "expired") {
      order.paymentStatus = "cancelled";
      saveOrder(order);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("2328.io webhook error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
