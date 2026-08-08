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
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";

  const subject = `[DELIVERY CONFIRMED] Order #${orderId} - ${productTitle}`;

  // 100% Inline Styled HTML for guaranteed rendering in Naver Mail, Gmail, Outlook, Apple Mail
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(subject)}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #050403; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        
        <!-- Outer Wrapper Table -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #050403; padding: 40px 10px;">
          <tr>
            <td align="center">
              
              <!-- Main Container Box (600px Max Width) -->
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #0d0a07; border: 1px solid #36291e; border-radius: 12px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.8);">
                
                <!-- Top Cyberpunk Accent Header -->
                <tr>
                  <td style="background-color: #140e0a; border-bottom: 2px solid #f29a47; padding: 24px 30px; text-align: left;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #f29a47; letter-spacing: 1px;">&gt;_ MIKHAIL_FUR STORE</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 11px; color: #78bd80; background-color: rgba(120,189,128,0.12); border: 1px solid #78bd80; padding: 4px 10px; border-radius: 4px; font-weight: bold;">PAID &amp; DELIVERED</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Email Body Content -->
                <tr>
                  <td style="padding: 32px 30px; text-align: left;">
                    
                    <!-- Headline -->
                    <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: bold; color: #f6eee4; line-height: 1.3;">
                      Your Digital Item is Ready! 🎉
                    </h1>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #b8a697; line-height: 1.6;">
                      Thank you for your purchase of <strong style="color: #ffc98b;">${escapeHtml(productTitle)}</strong>. Your item has been manually verified and delivered below.
                    </p>

                    <!-- PROMINENT DIGITAL ITEM CONTENT BOX -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background-color: #07150a; border: 2px solid #78bd80; border-radius: 8px; padding: 20px; text-align: left;">
                          <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #78bd80; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px;">
                            🔑 YOUR DIGITAL ITEM / LICENSE CODE:
                          </div>
                          <div style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: bold; color: #78bd80; background-color: #030a04; border: 1px solid #16361c; padding: 16px; border-radius: 6px; word-break: break-all; white-space: pre-wrap; line-height: 1.6; letter-spacing: 1px;">${escapeHtml(itemContent)}</div>
                        </td>
                      </tr>
                    </table>

                    ${customNote ? `
                      <!-- Custom Admin Note Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                        <tr>
                          <td style="background-color: rgba(242,154,71,0.08); border-left: 4px solid #f29a47; border-radius: 0 6px 6px 0; padding: 14px 18px; text-align: left;">
                            <div style="font-size: 12px; font-weight: bold; color: #f29a47; margin-bottom: 4px;">💬 NOTE FROM ADMINISTRATOR:</div>
                            <div style="font-size: 13px; color: #f6eee4; line-height: 1.5;">${escapeHtml(customNote)}</div>
                          </td>
                        </tr>
                      </table>
                    ` : ''}

                    <!-- Order Metadata Details Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080604; border: 1px solid #281e16; border-radius: 8px; padding: 18px; margin-bottom: 28px;">
                      <tr>
                        <td style="font-size: 12px; color: #b8a697; padding-bottom: 8px;">Order ID:</td>
                        <td align="right" style="font-family: monospace; font-size: 12px; font-weight: bold; color: #ffc98b; padding-bottom: 8px;">#${escapeHtml(orderId)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #b8a697; padding-bottom: 8px;">Product:</td>
                        <td align="right" style="font-size: 12px; font-weight: bold; color: #f6eee4; padding-bottom: 8px;">${escapeHtml(productTitle)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #b8a697;">Recipient Email:</td>
                        <td align="right" style="font-family: monospace; font-size: 12px; color: #f6eee4;">${escapeHtml(to)}</td>
                      </tr>
                    </table>

                    <!-- Support Button -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 12px;">
                      <tr>
                        <td align="center">
                          <a href="${telegramUrl}" target="_blank" style="display: inline-block; background-color: #f29a47; color: #080604; font-family: monospace; font-size: 13px; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px;">💬 CONTACT SUPPORT ON TELEGRAM</a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #080604; border-top: 1px solid #281e16; padding: 20px 30px; text-align: center; font-size: 11px; color: #78685b; line-height: 1.6;">
                    mikhailfur.lab · Official Digital Delivery System via Resend<br>
                    Need help? Reply to this email or message on Telegram.
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

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
