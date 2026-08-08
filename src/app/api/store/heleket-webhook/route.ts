import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Heleket is deprecated. Use /api/store/pay2328-webhook" }, { status: 410 });
}
