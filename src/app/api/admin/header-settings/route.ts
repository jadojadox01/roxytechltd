import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }
    let settings = await prisma.headerSetting.findFirst();
    if (!settings) settings = await prisma.headerSetting.create({ data: {} });
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    const contentType = request.headers.get("content-type") || "";
    const updateData: Record<string, any> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const siteName = formData.get("siteName")?.toString();
      const headerText = formData.get("headerText")?.toString();
      const removeLogo = formData.get("removeLogo")?.toString();

      if (siteName !== undefined) updateData.siteName = siteName;
      if (headerText !== undefined) updateData.headerText = headerText;
      if (removeLogo === "true") updateData.headerLogo = null;

      const logoFile = formData.get("headerLogo");
      if (logoFile instanceof File && logoFile.size > 0) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "logo");
        await fs.mkdir(uploadDir, { recursive: true });
        const ext = path.extname(logoFile.name || ".png") || ".png";
        const safeName = `logo-${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, Buffer.from(await logoFile.arrayBuffer()));
        updateData.headerLogo = `/uploads/logo/${safeName}`;
      }
    } else {
      const body = await request.json();
      if (body.siteName !== undefined) updateData.siteName = body.siteName;
      if (body.headerText !== undefined) updateData.headerText = body.headerText;
      if (body.removeLogo === true) updateData.headerLogo = null;
    }

    const existing = await prisma.headerSetting.findFirst();
    const settings = existing
      ? await prisma.headerSetting.update({ where: { id: existing.id }, data: updateData })
      : await prisma.headerSetting.create({ data: updateData });

    // Bust cached getters so the storefront header reflects the new logo/name immediately
    revalidateTag("header-setting", "max");
    revalidateTag("header-logo", "max");
    revalidateTag("site-name", "max");

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
