import { NextRequest, NextResponse } from "next/server";
import { getOrderById, isValidAdminToken, saveOrder, sendDeliveryEmail, sendTelegramMessage } from "@/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token") || request.cookies.get("admin_token")?.value;
  if (!token || !(await isValidAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  try {
    const { orderId, itemContent, customNote } = await request.json();

    if (!orderId || !itemContent) {
      return NextResponse.json({ error: "Order ID and item content are required." }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Send email via Resend
    const resendResult = await sendDeliveryEmail({
      to: order.customerEmail,
      productTitle: order.productTitle,
      orderId: order.orderId,
      itemContent,
      customNote,
    });

    if (!resendResult.success) {
      return NextResponse.json({ error: resendResult.error || "Failed to deliver email via Resend." }, { status: 502 });
    }

    order.paymentStatus = "fulfilled";
    order.fulfilledAt = new Date().toISOString();
    order.deliveryNotes = itemContent + (customNote ? `\n\nNote: ${customNote}` : "");
    if (resendResult.id) order.resendEmailId = resendResult.id;

    await saveOrder(order);

    // Notify Telegram Admin Bot
    const msg = [
      `✅ <b>ORDER FULFILLED & DELIVERED VIA RESEND!</b>`,
      `----------------------------------------`,
      `📦 <b>Product:</b> ${order.productTitle}`,
      `📧 <b>Delivered To:</b> <code>${order.customerEmail}</code>`,
      `🆔 <b>Order ID:</b> <code>${order.orderId}</code>`,
      `✉️ <b>Resend Email ID:</b> <code>${resendResult.id || "simulated"}</code>`,
      `----------------------------------------`,
      `<i>The customer has received their item via Resend email!</i>`,
    ].join("\n");

    void sendTelegramMessage(msg);

    return NextResponse.json({
      success: true,
      message: `Order #${orderId} fulfilled and sent to ${order.customerEmail} via Resend.`,
      resendId: resendResult.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Order fulfillment failed." }, { status: 500 });
  }
}
