export async function sendDeliveryEmail({
  to,
  productTitle,
  orderId,
  itemContent,
  customNote,
}: {
  to: string;
  productTitle: string;
  orderId: string;
  itemContent: string;
  customNote?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Mikhail Store <onboarding@resend.dev>";

  const subject = `[DELIVERY] Order #${orderId} - ${productTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0907; color: #f6eee4; margin: 0; padding: 30px; }
          .container { max-width: 600px; margin: 0 auto; background: #100d0a; border: 1px solid #51402f; border-radius: 8px; padding: 30px; }
          .header { border-bottom: 1px solid #30241b; padding-bottom: 20px; margin-bottom: 20px; text-align: center; }
          .brand { color: #f29a47; font-size: 20px; font-weight: bold; font-family: monospace; }
          .title { color: #ffc98b; font-size: 18px; margin: 15px 0 5px 0; }
          .order-id { color: #b8a697; font-size: 12px; font-family: monospace; margin-bottom: 25px; }
          .content-box { background: #070504; border: 1px dashed #f29a47; border-radius: 6px; padding: 20px; margin: 20px 0; font-family: monospace; white-space: pre-wrap; word-break: break-all; color: #78bd80; font-size: 14px; line-height: 1.6; }
          .note-box { background: rgba(242, 154, 71, 0.08); border-left: 3px solid #f29a47; padding: 12px 16px; margin: 20px 0; color: #f6eee4; font-size: 13px; }
          .footer { text-align: center; font-size: 11px; color: #b8a697; margin-top: 30px; border-top: 1px solid #30241b; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">&gt;_ MIKHAIL_FUR STORE</div>
            <div class="title">Product Delivery Confirmed</div>
            <div class="order-id">Order ID: #${orderId}</div>
          </div>
          
          <p>Hello,</p>
          <p>Thank you for your purchase of <strong>${productTitle}</strong>. Your item has been fulfilled manually by the administrator and is ready below:</p>
          
          <div class="content-box">${escapeHtml(itemContent)}</div>
          
          ${customNote ? `<div class="note-box"><strong>Note from admin:</strong> ${escapeHtml(customNote)}</div>` : ''}
          
          <p>If you have any questions or need support, reply directly to this email or reach out on Telegram.</p>
          
          <div class="footer">
            mikhailfur.lab · Automated Store Delivery via Resend
          </div>
        </div>
      </body>
    </html>
  `;

  if (!apiKey) {
    console.warn("RESEND_API_KEY is missing. Demo mode fulfillment email log:", { to, subject, itemContent });
    return { success: true, id: `demo_resend_${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
      }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return { success: false, error: data.message || "Resend API error" };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("Resend email delivery exception:", err);
    return { success: false, error: err.message || "Failed to connect to Resend API" };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
