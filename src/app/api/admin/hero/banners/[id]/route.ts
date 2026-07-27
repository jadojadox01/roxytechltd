import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";
import { deleteHeroBanner } from "@/lib/hero-db";
import { prismaClientInstance } from "@/lib/prismaDB";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const bannerId = Number(id);
    if (Number.isNaN(bannerId)) {
      return NextResponse.json({ success: false, message: "Invalid banner id" }, { status: 400 });
    }

    const existing = await prismaClientInstance.$queryRaw<{ bannerName: string | null }[]>`
      SELECT "bannerName" FROM "HeroBanner" WHERE id = ${bannerId} LIMIT 1
    `;
    if (!existing.length) {
      return NextResponse.json({ success: false, message: "Banner not found" }, { status: 404 });
    }

    await deleteHeroBanner(bannerId);

    revalidateTag("heroSliders", "max");
    revalidateTag("heroBanners", "max");

    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "HERO_BANNER_DELETED",
      module: "SETTINGS",
      entityId: String(bannerId),
      entityName: existing[0].bannerName || "Banner",
      description: `Deleted hero banner "${existing[0].bannerName}"`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE hero banner error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to delete banner" },
      { status: 500 }
    );
  }
}
