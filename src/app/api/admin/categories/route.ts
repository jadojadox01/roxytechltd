import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { promises as fs } from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function GET() {
  const categories = await prismaClientInstance.category.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";
  let title = "";
  let slug = "";
  let description: string | null = null;
  let imagePath: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    title = formData.get("title")?.toString() || "";
    slug = formData.get("slug")?.toString() || "";
    description = formData.get("description")?.toString() || null;

    const imageFile = formData.get("image");
    if (imageFile && imageFile instanceof File) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(imageFile.name || "image.jpg")}`;
      const filePath = path.join(uploadDir, safeName);
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      imagePath = `/uploads/categories/${safeName}`;
    }
  } else {
    const body = await req.json();
    title = body.title || "";
    slug = body.slug || "";
    description = body.description ?? null;
    imagePath = body.image ?? null;
  }

  title = title.trim();
  slug = slug.trim();

  if (!title || !slug) {
    return new NextResponse(JSON.stringify({ error: "Missing title or slug" }), { status: 400 });
  }

  const category = await prismaClientInstance.category.create({
    data: { title, slug, image: imagePath ?? null, description: description ?? null },
  });

  revalidateTag("categories", "max");
  revalidateTag("products", "max");
  return NextResponse.json(category);
}
