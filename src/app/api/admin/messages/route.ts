import { NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const messages = await prismaClientInstance.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return NextResponse.json({ success: true, messages, unreadCount });
  } catch (error: unknown) {
    console.error("GET CONTACT MESSAGES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
