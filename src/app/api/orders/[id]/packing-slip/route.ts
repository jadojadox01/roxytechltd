import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { requireStaff } from "@/lib/rbac";
import { buildPackingSlipPdf } from "@/lib/packing-slip-pdf";
import { getSiteName } from "@/get-api-data/seo-setting";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const storeName = await getSiteName();
    const pdf = await buildPackingSlipPdf(
      {
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        shippingName: order.shippingName,
        shippingPhone: order.shippingPhone,
        shippingAddress: order.shippingAddress,
        items: order.items.map((item: { productTitle: string; quantity: number }) => ({
          productTitle: item.productTitle,
          quantity: item.quantity,
        })),
      },
      storeName || "ROXIN STORE"
    );

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="packing-slip-${order.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error("[packing-slip]", err);
    return NextResponse.json({ success: false, message: "Failed to build packing slip" }, { status: 500 });
  }
}
