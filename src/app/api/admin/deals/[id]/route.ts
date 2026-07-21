import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { promises as fs } from "fs";
import path from "path";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
  }

  const { id } = await params;
  const dealId = Number(id);
  if (Number.isNaN(dealId)) {
    return NextResponse.json({ success: false, message: "Invalid deal id" }, { status: 400 });
  }

  const formData = await req.formData();
  const updateData: Record<string, any> = {};

  const title = formData.get("title")?.toString();
  const subtitle = formData.get("subtitle")?.toString();
  const date = formData.get("date")?.toString();
  const productId = formData.get("productId")?.toString();

  if (title !== undefined && title !== "") updateData.title = title.trim();
  if (subtitle !== undefined && subtitle !== "") updateData.subtitle = subtitle.trim();
  if (date !== undefined && date !== "") updateData.date = date.trim();
  if (productId !== undefined && productId !== "") updateData.productId = productId;

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "deals");
    await fs.mkdir(uploadDir, { recursive: true });
    const ext = path.extname(imageFile.name || ".png") || ".png";
    const safeName = `deal-${Date.now()}${ext}`;
    await fs.writeFile(path.join(uploadDir, safeName), Buffer.from(await imageFile.arrayBuffer()));
    updateData.countdownImage = `/uploads/deals/${safeName}`;
  }

  const deal = await prismaClientInstance.countdown.update({
    where: { id: dealId },
    data: updateData,
  });

  revalidateTag("countdowns", "max");
  return NextResponse.json({ success: true, deal });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
  }

  const { id } = await params;
  const dealId = Number(id);
  if (Number.isNaN(dealId)) {
    return NextResponse.json({ success: false, message: "Invalid deal id" }, { status: 400 });
  }

  await prismaClientInstance.countdown.delete({ where: { id: dealId } });
  revalidateTag("countdowns", "max");
  return NextResponse.json({ success: true });
}
