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
  const product = await prismaClientInstance.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";

  let title: string | undefined;
  let slug: string | undefined;
  let price: string | undefined;
  let discountedPrice: string | null | undefined;
  let quantity: number | undefined;
  let categoryId: string | null | undefined;
  let description: string | null | undefined;
  let shortDescription: string | null | undefined;
  let isNewArrival: boolean | undefined;
  // images that the user kept from the existing set
  let keptImages: string[] = [];
  // newly uploaded image paths
  let newImagePaths: string[] = [];

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    title = formData.get("title")?.toString() || undefined;
    slug = formData.get("slug")?.toString() || undefined;
    price = formData.get("price")?.toString() || undefined;

    const rawDiscounted = formData.get("discountedPrice")?.toString() ?? "";
    discountedPrice = rawDiscounted.trim() !== "" ? rawDiscounted : null;

    quantity = Number(formData.get("quantity")?.toString() ?? 0);
    categoryId = formData.get("categoryId")?.toString() || undefined;
    description = formData.get("description")?.toString() ?? null;
    shortDescription = formData.get("shortDescription")?.toString() ?? null;
    const rawNewArrival = formData.get("isNewArrival")?.toString();
    if (rawNewArrival !== undefined) isNewArrival = rawNewArrival === "true";

    // Existing images the user chose to keep
    const existingImagesRaw = formData.get("existingImages")?.toString();
    if (existingImagesRaw) {
      try {
        keptImages = JSON.parse(existingImagesRaw).filter(Boolean);
      } catch {
        keptImages = [];
      }
    }

    // New files
    const files = formData.getAll("images").filter((v): v is File => v instanceof File && v.size > 0);
    if (files.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
      await fs.mkdir(uploadDir, { recursive: true });
      for (const file of files) {
        const ext = path.extname(file.name || ".jpg") || ".jpg";
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
        newImagePaths.push(`/uploads/products/${safeName}`);
      }
    }
  } else {
    const body = await req.json();
    title = body.title;
    slug = body.slug;
    price = body.price;
    discountedPrice = body.discountedPrice ?? null;
    quantity = body.quantity;
    categoryId = body.categoryId;
    description = body.description ?? null;
    shortDescription = body.shortDescription ?? null;
    if (body.isNewArrival !== undefined) isNewArrival = body.isNewArrival === true || body.isNewArrival === "true";
    keptImages = Array.isArray(body.existingImages) ? body.existingImages.filter(Boolean) : [];
    newImagePaths = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
  }

  // Merge kept + new images; only update the images column if the client sent existingImages
  const mergedImages = [...keptImages, ...newImagePaths];

  const updated = await prismaClientInstance.product.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(price !== undefined && { price: String(price) }),
      ...(discountedPrice !== undefined && { discountedPrice: discountedPrice ? String(discountedPrice) : null }),
      ...(quantity !== undefined && { quantity }),
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(description !== undefined && { description }),
      ...(shortDescription !== undefined && { shortDescription }),
      ...(isNewArrival !== undefined && { isNewArrival }),
      // Always update images if mergedImages was derived from client input
      images: mergedImages,
    },
  });

  // Also update productVariants to match new images so the homepage sees changes
  if (mergedImages.length > 0) {
    // Delete old variants and recreate from the merged image set
    await prismaClientInstance.productVariant.deleteMany({ where: { productId: id } });
    await prismaClientInstance.productVariant.createMany({
      data: mergedImages.map((image, index) => ({
        productId: id,
        image,
        color: null,
        size: null,
        isDefault: index === 0,
      })),
    });
  }

  // Bust the Next.js cache so the homepage/shop reflects changes immediately
  revalidateTag("products", "max");

  return NextResponse.json({ ...updated, price: updated.price.toString(), discountedPrice: updated.discountedPrice?.toString() ?? null });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await prismaClientInstance.product.delete({ where: { id } });
  revalidateTag("products", "max");
  return new NextResponse(null, { status: 204 });
}
