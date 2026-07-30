import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/rbac";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";
export const maxDuration = 60;

async function syncSeoSiteName(siteName: string) {
  const seo = await prisma.seoSetting.findFirst();
  if (seo) {
    await prisma.seoSetting.update({
      where: { id: seo.id },
      data: { siteName },
    });
    return;
  }

  await prisma.seoSetting.create({
    data: { siteName },
  });
}

async function uploadLogo(file: File): Promise<string> {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
  const type = (file.type || "").toLowerCase();
  const isAllowedType =
    !type || allowedTypes.includes(type) || type === "image/jpg";

  if (!isAllowedType) {
    throw new Error("Logo must be PNG, JPEG, WEBP, or SVG");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Logo must be under 4 MB");
  }

  try {
    return await uploadImageFile(file, "header", "logo");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloudinary upload failed";
    // Surface a clearer branding error for the admin toast.
    throw new Error(message.startsWith("Image upload failed:") ? message : `Cloudinary upload failed: ${message}`);
  }
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    let settings = await prisma.headerSetting.findFirst();

    if (!settings) {
      settings = await prisma.headerSetting.create({
        data: {},
      });
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: unknown) {
    console.error("GET HEADER SETTINGS ERROR:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch settings";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const formData = await request.formData();
    const siteName = formData.get("siteName")?.toString().trim() ?? "";
    const headerText = formData.get("headerText")?.toString().trim() ?? "";
    const removeLogo = formData.get("removeLogo")?.toString() === "true";
    const logo = formData.get("headerLogo");

    let logoUrl: string | undefined;

    if (logo instanceof File && logo.size > 0) {
      logoUrl = await uploadLogo(logo);
    }

    let settings = await prisma.headerSetting.findFirst();

    if (!settings) {
      settings = await prisma.headerSetting.create({
        data: {
          siteName,
          headerText,
          headerLogo: removeLogo ? null : logoUrl,
        },
      });
    } else {
      settings = await prisma.headerSetting.update({
        where: { id: settings.id },
        data: {
          siteName,
          headerText,
          ...(removeLogo
            ? { headerLogo: null }
            : logoUrl
              ? { headerLogo: logoUrl }
              : {}),
        },
      });
    }

    if (siteName) {
      await syncSeoSiteName(siteName);
    }

    revalidateTag("header-setting", "max");
    revalidateTag("header-logo", "max");
    revalidateTag("site-name", "max");
    revalidateTag("seo-setting", "max");

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: unknown) {
    console.error("HEADER SETTINGS UPDATE ERROR:", error);
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
