import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    const orders = await prismaClientInstance.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const transformed = orders.map((order) => ({
      ...order,
      totalPrice: Number(order.totalPrice),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    return NextResponse.json({ success: true, orders: transformed });
  } catch (error: any) {
    console.error("Failed to fetch orders", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body || {};

    if (!orderId || !status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or invalid status" },
        { status: 400 }
      );
    }

    const updatedOrder = await prismaClientInstance.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        totalPrice: Number(updatedOrder.totalPrice),
      },
    });
  } catch (error: any) {
    console.error("Failed to update order", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update order" },
      { status: 500 }
    );
  }
}