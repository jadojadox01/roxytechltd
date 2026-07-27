import { NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();
    const isRead = body.isRead === true;

    const message = await prismaClientInstance.contactMessage.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: unknown) {
    console.error("PATCH CONTACT MESSAGE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    await prismaClientInstance.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE CONTACT MESSAGE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 }
    );
  }
}
