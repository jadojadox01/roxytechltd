import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      orders,
      recentActivities,
    ] = await Promise.all([
      prismaClientInstance.order.count(),
      prismaClientInstance.user.count({ where: { role: "USER" } }),
      prismaClientInstance.product.count(),
      prismaClientInstance.order.findMany({
        where: { status: { in: ["COMPLETED", "CONFIRMED", "READY_FOR_DELIVERY"] } },
        select: { totalPrice: true },
      }),
      prismaClientInstance.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

    const products = await prismaClientInstance.product.findMany({
      select: { price: true, quantity: true },
    });
    const inventoryValue = products.reduce(
      (sum, p) => sum + Number(p.price) * p.quantity,
      0
    );

    const lowStockFromProducts = await prismaClientInstance.product.findMany({
      where: { quantity: { lte: 5 } },
      select: { id: true, title: true, slug: true, quantity: true },
      take: 10,
    });

    const pendingOrders = await prismaClientInstance.order.count({
      where: { status: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        inventoryValue,
        pendingOrders,
        lowStockCount: lowStockFromProducts.length,
      },
      lowStockProducts: lowStockFromProducts,
      recentActivities,
    });
  } catch (err: unknown) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
