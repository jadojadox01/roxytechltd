import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, totalPrice, paymentMethod } = body || {};

    if (!customer?.userId) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to place an order" },
        { status: 401 }
      );
    }

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing checkout details" },
        { status: 400 }
      );
    }

    const order = await prismaClientInstance.order.create({
      data: {
        userId: customer.userId,
        shippingName: customer.name,
        shippingEmail: customer.email,
        shippingPhone: customer.phone,
        shippingAddress: customer.address,
        totalPrice: totalPrice ?? 0,
        paymentMethod: paymentMethod || "cod",
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            productTitle: item.name,
            quantity: item.quantity || 1,
            price: item.price * (item.quantity || 1),
            image: item.image,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order creation failed", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Unable to create order" },
      { status: 500 }
    );
  }
}
