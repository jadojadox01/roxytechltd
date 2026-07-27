import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import cloudinary from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/rbac";
import { isCloudinaryConfigured, saveLocalImage } from "@/lib/upload-image";

export const runtime = "nodejs";

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
  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Logo must be PNG, JPEG, WEBP, or SVG");
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Logo must be under 2 MB");
  }

  if (isCloudinaryConfigured()) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded: { secure_url?: string } = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "roxytech/header" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result ?? {});
        }
      );
      stream.end(buffer);
    });

    if (uploaded.secure_url) {
      return uploaded.secure_url;
    }
  }

  return saveLocalImage(file, "logo", "logo");
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
