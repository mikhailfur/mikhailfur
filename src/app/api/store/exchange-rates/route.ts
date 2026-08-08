import { NextResponse } from "next/server";
import { fetchExchangeRates } from "@/store/exchange-rates";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rates = await fetchExchangeRates();
    return NextResponse.json({ success: true, rates });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, rates: { KRW: 1380, KZT: 475, updatedAt: Date.now() } },
      { status: 500 }
    );
  }
}
