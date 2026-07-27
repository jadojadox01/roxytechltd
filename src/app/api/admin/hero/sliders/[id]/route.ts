import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/rbac";
import { logActivity } from "@/lib/activity-log";
import { deleteHeroSlider } from "@/lib/hero-db";
import { prismaClientInstance } from "@/lib/prismaDB";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const sliderId = Number(id);
    if (Number.isNaN(sliderId)) {
      return NextResponse.json({ success: false, message: "Invalid slide id" }, { status: 400 });
    }

    const existing = await prismaClientInstance.$queryRaw<{ sliderName: string }[]>`
      SELECT "sliderName" FROM "HeroSlider" WHERE id = ${sliderId} LIMIT 1
    `;
    if (!existing.length) {
      return NextResponse.json({ success: false, message: "Slide not found" }, { status: 404 });
    }

    await deleteHeroSlider(sliderId);

    revalidateTag("heroSliders", "max");
    revalidateTag("heroBanners", "max");

    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "HERO_SLIDE_DELETED",
      module: "SETTINGS",
      entityId: String(sliderId),
      entityName: existing[0].sliderName,
      description: `Deleted hero slide "${existing[0].sliderName}"`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE hero slider error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to delete slide" },
      { status: 500 }
    );
  }
}
