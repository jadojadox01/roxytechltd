import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prismaClientInstance.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  const isOwner = order.userId === session.user.id;
  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "STORE_KEEPER";

  if (!isOwner && !isStaff) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const allowed = ["CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "COMPLETED", "APPROVED"];
  if (!allowed.includes(order.status) && !isStaff) {
    return NextResponse.json(
      { success: false, message: "Receipt is available after the order is confirmed" },
      { status: 400 }
    );
  }

  const pdf = await buildOrderReceiptPdf(
    {
      id: order.id,
      createdAt: order.createdAt,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      shippingName: order.shippingName,
      shippingEmail: order.shippingEmail,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        productTitle: item.productTitle,
        quantity: item.quantity,
        price: Number(item.price),
      })),
    },
    process.env.SITE_NAME?.trim() || "NAALVA STORE"
  );

  const shortId = order.id.slice(0, 8).toUpperCase();
  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${shortId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
