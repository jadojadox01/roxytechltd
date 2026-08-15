import { NextRequest, NextResponse } from "next/server";
import { getCatalogPage } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const result = await getCatalogPage({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 12),
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
      q: searchParams.get("q") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[api/products/catalog]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load products",
        products: [],
        hasMore: false,
        total: 0,
      },
      { status: 500 }
    );
  }
}
