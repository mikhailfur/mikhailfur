import crypto from "node:crypto";

export interface Create2328PaymentParams {
  amount: string; // e.g. "15.00"
  currency: string; // e.g. "USD"
  order_id: string; // e.g. "ORD-88192"
  to_currency?: string; // e.g. "USDT"
  network?: string; // e.g. "tron"
  url_return?: string;
  url_success?: string;
  url_callback?: string;
}

export interface Pay2328Response {
  state: number;
  result?: {
    uuid: string;
    order_id: string;
    amount: string;
    payment_status: string;
    url: string;
    address?: string;
    expired_at: number;
  };
  message?: string;
}

export function generate2328Signature(data: object, apiKey: string): string {
  const json = JSON.stringify(data);
  const base64 = Buffer.from(json, "utf8").toString("base64");
  return crypto.createHmac("sha256", apiKey).update(base64).digest("hex");
}

export async function create2328Payment(
  params: Create2328PaymentParams
): Promise<{ success: boolean; url?: string; uuid?: string; error?: string }> {
  const projectUuid = process.env.PAY2328_PROJECT_UUID;
  const apiKey = process.env.PAY2328_API_KEY;

  if (!projectUuid || !apiKey) {
    console.warn("PAY2328_PROJECT_UUID or PAY2328_API_KEY is not set. Generating demo payment link.");
    return {
      success: true,
      url: `https://new-pay.2328.io/demo?order_id=${encodeURIComponent(params.order_id)}&amount=${params.amount}`,
      uuid: `pay2328_demo_${params.order_id}`,
    };
  }

  try {
    const sign = generate2328Signature(params, apiKey);

    const res = await fetch("https://api.2328.io/api/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MikhailLabStore/1.0 (+https://mikhailfur.lab)",
        "project": projectUuid,
        "sign": sign,
      },
      body: JSON.stringify(params),
      cache: "no-store",
    });

    const data: Pay2328Response = await res.json();

    if (data.state === 0 && data.result) {
      return {
        success: true,
        url: data.result.url,
        uuid: data.result.uuid,
      };
    }

    return {
      success: false,
      error: data.message || "Failed to create 2328.io payment invoice",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error connecting to 2328.io API";
    console.error("2328.io API Invoice Creation Error:", err);
    return {
      success: false,
      error: message,
    };
  }
}
