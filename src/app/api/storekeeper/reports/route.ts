import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { requireStaff } from "@/lib/rbac";

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedWhere = { status: "COMPLETED" as const };

    const [todayOrders, weekOrders, monthOrders, topProducts, categorySales] =
      await Promise.all([
        prisma.order.findMany({
          where: { ...completedWhere, createdAt: { gte: startOfDay } },
          select: { totalPrice: true, items: { select: { quantity: true } } },
        }),
        prisma.order.findMany({
          where: { ...completedWhere, createdAt: { gte: startOfWeek } },
          select: { totalPrice: true, items: { select: { quantity: true } } },
        }),
        prisma.order.findMany({
          where: { ...completedWhere, createdAt: { gte: startOfMonth } },
          select: { totalPrice: true, items: { select: { quantity: true } } },
        }),
        prisma.orderItem.groupBy({
          by: ["productTitle"],
          _sum: { quantity: true, price: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 10,
        }),
        prisma.product.findMany({
          select: {
            title: true,
            category: { select: { title: true } },
            orderItems: {
              select: { quantity: true, price: true },
            },
          },
          take: 200,
        }),
      ]);

    const summarize = (orders: { totalPrice: unknown; items: { quantity: number }[] }[]) => ({
      revenue: orders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
      orders: orders.length,
      units: orders.reduce(
        (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
        0
      ),
    });

    const byCategory: Record<string, { units: number; revenue: number }> = {};
    for (const product of categorySales) {
      const cat = product.category?.title || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = { units: 0, revenue: 0 };
      for (const item of product.orderItems) {
        byCategory[cat].units += item.quantity;
        byCategory[cat].revenue += Number(item.price) * item.quantity;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        today: summarize(todayOrders),
        week: summarize(weekOrders),
        month: summarize(monthOrders),
      },
      topProducts: topProducts.map((p: {
        productTitle: string;
        _sum: { quantity: number | null; price: unknown };
      }) => ({
        title: p.productTitle,
        units: p._sum.quantity || 0,
        revenue: Number(p._sum.price || 0),
      })),
      categoryBreakdown: Object.entries(byCategory).map(([title, stats]) => ({
        title,
        ...stats,
      })),
    });
  } catch (err) {
    console.error("[storekeeper/reports]", err);
    return NextResponse.json({ success: false, message: "Failed to load reports" }, { status: 500 });
  }
}
