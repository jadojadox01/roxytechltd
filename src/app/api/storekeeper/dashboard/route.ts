import { prismaClientInstance } from "@/lib/prismaDB";
import {
  getActiveOrderStatuses,
  getInProgressOrderStatuses,
  hasActivityLogTable,
} from "@/lib/schema-capabilities";
import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const [inProgressStatuses, activeStatuses, hasActivityLog] = await Promise.all([
      getInProgressOrderStatuses(),
      getActiveOrderStatuses(),
      hasActivityLogTable(),
    ]);

    const [
      totalProducts,
      pendingOrders,
      preparingOrders,
      lowStockProducts,
      recentOrders,
      todayCompleted,
    ] = await Promise.all([
      prismaClientInstance.product.count(),
      prismaClientInstance.order.count({ where: { status: "PENDING" } }),
      inProgressStatuses.length
        ? prismaClientInstance.order.count({ where: { status: { in: inProgressStatuses as never[] } } })
        : Promise.resolve(0),
      prismaClientInstance.product.findMany({
        where: { quantity: { lte: 5 } },
        select: { id: true, title: true, quantity: true, slug: true },
        take: 10,
      }),
      activeStatuses.length
        ? prismaClientInstance.order.findMany({
            where: { status: { in: activeStatuses as never[] } },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              items: true,
              user: { select: { name: true, email: true } },
            },
          })
        : Promise.resolve([]),
      prismaClientInstance.order.findMany({
        where: {
          status: "COMPLETED",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        select: {
          totalPrice: true,
          items: { select: { quantity: true } },
        },
      }),
    ]);

    const todaySales = todayCompleted.reduce((sum, o) => sum + Number(o.totalPrice), 0);
    const todayUnits = todayCompleted.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    let recentActivities: unknown[] = [];
    if (hasActivityLog) {
      recentActivities = await prismaClientInstance.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true, role: true } } },
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        pendingOrders,
        preparingOrders,
        lowStockCount: lowStockProducts.length,
        todaySales,
        todayUnits,
      },
      lowStockProducts,
      recentActivities,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        totalPrice: Number(o.totalPrice),
        items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
      })),
    });
  } catch (err: unknown) {
    console.error("Storekeeper dashboard error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard" }, { status: 500 });
  }
}
