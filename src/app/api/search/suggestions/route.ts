import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { activeProductWhere } from "@/lib/schema-capabilities";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 2) {
      return NextResponse.json({ items: [] });
    }

    const productFilter = await activeProductWhere();
    const items = await prisma.product.findMany({
      where: {
        ...productFilter,
        title: { contains: q, mode: "insensitive" },
      },
      select: { id: true, title: true, slug: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[search/suggestions]", error);
    return NextResponse.json({ items: [] });
  }
}
