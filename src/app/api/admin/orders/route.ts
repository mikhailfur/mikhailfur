import { NextRequest, NextResponse } from "next/server";
import { getOrders, isValidAdminToken } from "@/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.headers.get("x-admin-token") || request.cookies.get("admin_token")?.value;
  if (!token || !(await isValidAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  const orders = await getOrders();
  return NextResponse.json({ orders }, { headers: { "Cache-Control": "no-store" } });
}
