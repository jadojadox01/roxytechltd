import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { requireStaff } from "@/lib/rbac";

function toCsv(rows: string[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
          return value;
        })
        .join(",")
    )
    .join("\n");
}

export async function GET(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const type = req.nextUrl.searchParams.get("type") || "orders";
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");

    const dateFilter =
      from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {};

    if (type === "inventory") {
      const products = await prisma.product.findMany({
        orderBy: { title: "asc" },
        select: {
          title: true,
          sku: true,
          quantity: true,
          price: true,
          status: true,
          category: { select: { title: true } },
        },
      });

      const csv = toCsv([
        ["Title", "SKU", "Category", "Quantity", "Unit Price", "Stock Value", "Status"],
        ...products.map((p: {
          title: string;
          sku: string | null;
          quantity: number;
          price: unknown;
          status: string;
          category: { title: string } | null;
        }) => [
          p.title,
          p.sku || "",
          p.category?.title || "",
          String(p.quantity),
          String(Number(p.price)),
          String(Number(p.price) * p.quantity),
          p.status,
        ]),
      ]);

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="inventory-export.csv"`,
        },
      });
    }

    const orders = await prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { email: true, name: true } },
      },
      take: 5000,
    });

    const csv = toCsv([
      [
        "Order ID",
        "Date",
        "Status",
        "Customer",
        "Email",
        "Phone",
        "Payment",
        "Items",
        "Total",
        "Address",
      ],
      ...orders.map((o: {
        id: string;
        createdAt: Date;
        status: string;
        shippingName: string;
        shippingEmail: string;
        shippingPhone: string;
        paymentMethod: string;
        totalPrice: unknown;
        shippingAddress: string;
        items: Array<{ productTitle: string; quantity: number }>;
        user: { email: string; name: string | null } | null;
      }) => [
        o.id,
        o.createdAt.toISOString(),
        o.status,
        o.shippingName,
        o.shippingEmail || o.user?.email || "",
        o.shippingPhone,
        o.paymentMethod,
        o.items.map((i: { productTitle: string; quantity: number }) => `${i.productTitle} x${i.quantity}`).join("; "),
        String(Number(o.totalPrice)),
        o.shippingAddress,
      ]),
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-export.csv"`,
      },
    });
  } catch (err) {
    console.error("[reports/export]", err);
    return NextResponse.json({ success: false, message: "Export failed" }, { status: 500 });
  }
}
