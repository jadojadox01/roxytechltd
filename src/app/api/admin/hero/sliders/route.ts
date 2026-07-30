import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";
import { createHeroSlider, listHeroSlidersAdmin } from "@/lib/hero-db";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function saveImage(file: File, prefix: string) {
  return uploadImageFile(file, "hero/sliders", prefix);
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const rows = await listHeroSlidersAdmin();
    const sliders = rows.map((row) => ({
      id: row.id,
      sliderName: row.sliderName,
      sliderImage: row.sliderImage,
      discountRate: row.discountRate,
      slug: row.slug,
      productId: row.productId,
      headline: row.headline,
      description: row.description,
      ctaLabel: row.ctaLabel,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      product: row.productTitle
        ? { title: row.productTitle, slug: row.productSlug }
        : null,
    }));

    return NextResponse.json({ success: true, sliders });
  } catch (err) {
    console.error("GET hero sliders error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Failed to load slides" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await req.formData();
    const sliderName = formData.get("sliderName")?.toString().trim() || "";
    const productIdRaw = formData.get("productId")?.toString().trim() || "";
    const productId = productIdRaw || null;
    const discountRate = Number(formData.get("discountRate") ?? 0);
    const headline = formData.get("headline")?.toString().trim() || null;
    const description = formData.get("description")?.toString().trim() || null;
    const ctaLabel = formData.get("ctaLabel")?.toString().trim() || "Shop Now";
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const imageFile = formData.get("image");

    if (!sliderName) {
      return NextResponse.json(
        { success: false, message: "Slide label is required" },
        { status: 400 }
      );
    }

    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return NextResponse.json({ success: false, message: "Slide image is required" }, { status: 400 });
    }

    let product: { id: string; title: string; slug: string } | null = null;
    if (productId) {
      product = await prismaClientInstance.product.findUnique({
        where: { id: productId },
        select: { id: true, title: true, slug: true },
      });
      if (!product) {
        return NextResponse.json({ success: false, message: "Selected product not found" }, { status: 400 });
      }
    }

    const sliderImage = await saveImage(imageFile, "slide");
    const baseSlug = slugify(headline || sliderName) || "hero-slide";
    const slug = `${baseSlug}-${Date.now()}`;

    const slider = await createHeroSlider({
      sliderName,
      sliderImage,
      discountRate: Number.isFinite(discountRate) ? discountRate : 0,
      slug,
      productId,
      headline,
      description,
      ctaLabel,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    });

    try {
      revalidateTag("heroSliders", "max");
      revalidateTag("heroBanners", "max");
    } catch (revalidateError) {
      console.error("Hero slide revalidate error:", revalidateError);
    }

    try {
      await logActivity({
        userId: session!.user.id,
        userName: session!.user.name || session!.user.email,
        userRole: session!.user.role,
        action: "HERO_SLIDE_CREATED",
        module: "SETTINGS",
        entityId: String(slider.id),
        entityName: slider.sliderName,
        description: `Created hero slide "${slider.sliderName}"`,
        ...getRequestMeta(req),
      });
    } catch (logError) {
      console.error("Hero slide activity log error:", logError);
    }

    return NextResponse.json(
      {
        success: true,
        slider: {
          ...slider,
          product: product ? { title: product.title, slug: product.slug } : null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST hero slider error:", err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Failed to create slide";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
