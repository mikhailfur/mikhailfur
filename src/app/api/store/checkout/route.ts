import { NextRequest, NextResponse } from "next/server";
import { create2328Payment, getProductById, saveOrder, sendTelegramMessage, StoreOrder } from "@/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { productId, customerEmail } = await request.json();

    if (!productId || !customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Product ID and valid customer email are required." }, { status: 400 });
    }

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    if (product.stockStatus === "out_of_stock") {
      return NextResponse.json({ error: "Product is currently out of stock." }, { status: 400 });
    }

    const orderId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const host = request.headers.get("host") || "mikhailfur.lab";
    const protocol = request.headers.get("x-forwarded-proto") || "https";

    // Create 2328.io Crypto Payment Session
    const invoiceRes = await create2328Payment({
      amount: product.price.toFixed(2),
      currency: "USD",
      order_id: orderId,
      url_return: `${protocol}://${host}/#terminal`,
      url_success: `${protocol}://${host}/#terminal`,
      url_callback: `${protocol}://${host}/api/store/pay2328-webhook`,
    });

    if (!invoiceRes.success || !invoiceRes.url) {
      return NextResponse.json({ error: invoiceRes.error || "Payment provider error." }, { status: 502 });
    }

    const newOrder: StoreOrder = {
      orderId,
      productId: product.id,
      productTitle: product.title,
      amount: product.price,
      currency: "USD",
      customerEmail,
      paymentMethod: "pay2328",
      paymentStatus: "pending",
      pay2328Uuid: invoiceRes.uuid,
      pay2328Url: invoiceRes.url,
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);

    // Notify Telegram Admin Bot
    const msg = [
      `⚡ <b>NEW 2328.io CRYPTO CHECKOUT CREATED!</b>`,
      `----------------------------------------`,
      `🛒 <b>Order ID:</b> <code>#${orderId}</code>`,
      `📦 <b>Item:</b> ${product.title}`,
      `💵 <b>Amount:</b> $${product.price.toFixed(2)} USD`,
      `📧 <b>Email:</b> <code>${customerEmail}</code>`,
      `🔗 <b>Invoice URL:</b> ${invoiceRes.url}`,
      `----------------------------------------`,
      `⏱️ <i>Manual delivery after payment verification (2-3 hours).</i>`,
    ].join("\n");

    void sendTelegramMessage(msg);

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: invoiceRes.url,
    });
  } catch (err: any) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ error: err.message || "Checkout failed." }, { status: 500 });
  }
}
