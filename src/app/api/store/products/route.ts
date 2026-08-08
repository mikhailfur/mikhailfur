import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProducts, isValidAdminToken, saveProduct, StoreProduct } from "@/store";

export const runtime = "nodejs";

export async function GET() {
  const products = getProducts();
  return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token") || request.cookies.get("admin_token")?.value;
  if (!token || !isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, price, currency, badge, category, stockStatus, itemContent } = body;

    if (!title || !description || typeof price !== "number") {
      return NextResponse.json({ error: "Invalid product parameters." }, { status: 400 });
    }

    const newProduct: StoreProduct = {
      id: id || `prod_${Date.now().toString(36)}`,
      title,
      description,
      price,
      currency: currency || "USD",
      badge: badge || undefined,
      category: category || "digital",
      stockStatus: stockStatus || "in_stock",
      itemContent: itemContent || "",
      createdAt: new Date().toISOString(),
    };

    saveProduct(newProduct);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save product." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.headers.get("x-admin-token") || request.cookies.get("admin_token")?.value;
  if (!token || !isValidAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing product ID." }, { status: 400 });

  deleteProduct(id);
  return NextResponse.json({ success: true });
}
