import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { revalidateTag } from "next/cache";
import { uploadImageFile } from "@/lib/upload-image";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
  }
  const deals = await prismaClientInstance.countdown.findMany({
    orderBy: { updatedAt: "desc" },
    include: { product: { select: { title: true } } },
  });
  return NextResponse.json({ success: true, deals });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get("title")?.toString().trim() || "";
  const subtitle = formData.get("subtitle")?.toString().trim() || "";
  const date = formData.get("date")?.toString().trim() || "";
  const productId = formData.get("productId")?.toString() || "";

  if (!title || !subtitle || !date || !productId) {
    return NextResponse.json(
      { success: false, message: "Title, subtitle, end date and product are required" },
      { status: 400 }
    );
  }

  let countdownImage: string | null = null;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    countdownImage = await uploadImageFile(imageFile, "deals", "deal");
  }

  const deal = await prismaClientInstance.countdown.create({
    data: { title, subtitle, date, productId, countdownImage },
  });

  revalidateTag("countdowns", "max");
  return NextResponse.json({ success: true, deal });
}
