import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";
import { createHeroBanner, deleteHeroBanner, listHeroBannersAdmin } from "@/lib/hero-db";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function saveImage(file: File) {
  return uploadImageFile(file, "hero/banners", "banner");
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rows = await listHeroBannersAdmin();
    const banners = rows.map((row) => ({
      id: row.id,
      bannerName: row.bannerName,
      bannerImage: row.bannerImage,
      subtitle: row.subtitle,
      slug: row.slug,
      productId: row.productId,
      ctaLabel: row.ctaLabel,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      product: { title: row.productTitle, slug: row.productSlug },
    }));

    return NextResponse.json({ success: true, banners });
  } catch (err) {
    console.error("GET hero banners error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to load banners" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const bannerName = formData.get("bannerName")?.toString().trim() || "";
    const subtitle = formData.get("subtitle")?.toString().trim() || null;
    const productId = formData.get("productId")?.toString() || "";
    const ctaLabel = formData.get("ctaLabel")?.toString().trim() || "View Deal";
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const imageFile = formData.get("image");

    if (!bannerName || !productId) {
      return NextResponse.json(
        { success: false, message: "Title and product are required" },
        { status: 400 }
      );
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json({ success: false, message: "Banner image is required" }, { status: 400 });
    }

    const product = await prismaClientInstance.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, slug: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, message: "Selected product not found" }, { status: 400 });
    }

    const bannerImage = await saveImage(imageFile);
    const slug = `${slugify(bannerName) || "hero-banner"}-${Date.now()}`;

    const banner = await createHeroBanner({
      bannerName,
      bannerImage,
      subtitle,
      slug,
      productId,
      ctaLabel,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    revalidateTag("heroSliders", "max");
    revalidateTag("heroBanners", "max");

    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "HERO_BANNER_CREATED",
      module: "SETTINGS",
      entityId: String(banner.id),
      entityName: banner.bannerName || "Banner",
      description: `Created hero banner "${banner.bannerName}"`,
      ...getRequestMeta(req),
    });

    return NextResponse.json(
      {
        success: true,
        banner: {
          ...banner,
          product: { title: product.title, slug: product.slug },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST hero banner error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to create banner" },
      { status: 500 }
    );
  }
}
