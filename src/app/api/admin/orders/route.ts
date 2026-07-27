import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireStaff } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";
import {
  normalizeOrderStatusForWrite,
  productHasStatusColumn,
} from "@/lib/schema-capabilities";

const MODERN_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "COMPLETED",
  "REJECTED",
  "APPROVED",
];

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const orders = await prismaClientInstance.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
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
  } catch (error: unknown) {
    console.error("Failed to fetch orders", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireStaff();
  if (error) return error;

  try {
    const body = await request.json();
    const { orderId, status: requestedStatus } = body || {};
    const normalizedStatus = requestedStatus
      ? await normalizeOrderStatusForWrite(requestedStatus)
      : null;

    if (!orderId || !requestedStatus || !normalizedStatus) {
      return NextResponse.json(
        { success: false, message: "Missing orderId or invalid status" },
        { status: 400 }
      );
    }

    if (!MODERN_STATUSES.includes(requestedStatus)) {
      return NextResponse.json(
        { success: false, message: "Unsupported status value" },
        { status: 400 }
      );
    }

    const existing = await prismaClientInstance.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await prismaClientInstance.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus as never },
      include: { items: true },
    });

    const hasStatus = await productHasStatusColumn();
    const isCompleted =
      requestedStatus === "COMPLETED" ||
      (normalizedStatus === "APPROVED" && existing.status === "PENDING");

    if (isCompleted && existing.status !== normalizedStatus) {
      for (const item of existing.items) {
        const product = await prismaClientInstance.product.findUnique({
          where: { id: item.productId },
        });
        if (product && product.quantity >= item.quantity) {
          const newStock = product.quantity - item.quantity;
          const updateData: Record<string, unknown> = { quantity: newStock };
          if (hasStatus) {
            updateData.status = newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE";
            updateData.isAvailable = newStock > 0;
          }
          await prismaClientInstance.product.update({
            where: { id: item.productId },
            data: updateData,
          });
        }
      }
    }

    const meta = getRequestMeta(request);
    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: "ORDER_STATUS_CHANGED",
      module: "ORDER",
      entityId: orderId,
      entityName: `Order #${orderId.slice(0, 8)}`,
      description: `Order status changed from ${existing.status} to ${normalizedStatus}`,
      oldValue: { status: existing.status },
      newValue: { status: normalizedStatus },
      ...meta,
    });

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        totalPrice: Number(updatedOrder.totalPrice),
      },
    });
  } catch (error: unknown) {
    console.error("Failed to update order", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}
