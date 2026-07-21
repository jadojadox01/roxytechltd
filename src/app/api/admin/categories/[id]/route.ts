import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { promises as fs } from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prismaClientInstance.category.findUnique({ where: { id } });
  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";

  const updateData: Record<string, any> = {};

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const slug = formData.get("slug")?.toString();
    const description = formData.get("description")?.toString();

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description || null;

    // Only update image if a new file was actually uploaded
    const imageFile = formData.get("image");
    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(imageFile.name || ".jpg") || ".jpg"}`;
      const filePath = path.join(uploadDir, safeName);
      await fs.writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()));
      updateData.image = `/uploads/categories/${safeName}`;
    }
    // If no new image file, do NOT touch the image field — keeps existing image
  } else {
    const body = await req.json();
    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description ?? null;
    if (body.image !== undefined) updateData.image = body.image ?? null;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prismaClientInstance.category.update({
    where: { id },
    data: updateData,
  });

  revalidateTag("categories", "max");
  revalidateTag("products", "max");

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await prismaClientInstance.category.delete({ where: { id } });
  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  return new NextResponse(null, { status: 204 });
}
