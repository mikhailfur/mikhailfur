import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const envUsername = process.env.CIVITAI_USERNAME || process.env.NEXT_PUBLIC_CIVITAI_USERNAME || "mikhailfur";
    const username = searchParams.get("username") || envUsername;
    const limit = searchParams.get("limit") || "30";
    const cursor = searchParams.get("cursor") || "";
    const sort = searchParams.get("sort") || "Newest";
    const period = searchParams.get("period") || "AllTime";

    const params = new URLSearchParams({
      username,
      limit,
      sort,
      period,
      browsingLevel: "31",
      nsfw: "true",
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const primaryUrl = `https://civitai.red/api/v1/images?${params.toString()}`;
    const fallbackUrl = `https://civitai.com/api/v1/images?${params.toString()}`;

    let response = await fetch(primaryUrl, {
      headers: {
        "User-Agent": "MikhailFurWeb/1.0",
        "Accept": "application/json",
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!response.ok) {
      // Fallback to civitai.com
      response = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "MikhailFurWeb/1.0",
          "Accept": "application/json",
        },
        next: { revalidate: 300 },
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Civitai API returned status ${response.status}`, items: [], metadata: {} },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch images from Civitai API";
    return NextResponse.json({ error: message, items: [], metadata: {} }, { status: 500 });
  }
}
