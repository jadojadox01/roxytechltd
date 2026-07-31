import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import { notifyOrderPlaced } from "@/lib/order-emails";
import { markCouponUsed, validateAndComputeCoupon } from "@/lib/coupon";

type CheckoutItem = {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to place an order" },
        { status: 401 }
      );
    }

    if (session.user.role === "ADMIN" || session.user.role === "STORE_KEEPER") {
      return NextResponse.json(
        {
          success: false,
          message: "Staff accounts cannot place orders. Please use a customer account.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { customer, items, paymentMethod, couponCode } = body || {};

    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone ||
      !customer?.address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Missing checkout details" },
        { status: 400 }
      );
    }

    const productIds = items.map((item: CheckoutItem) => item.id).filter(Boolean);
    const products = await prismaClientInstance.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        price: true,
        discountedPrice: true,
        quantity: true,
        productVariants: { select: { image: true, isDefault: true }, take: 1 },
        images: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let computedTotal = 0;
    const orderItems: {
      productId: string;
      productTitle: string;
      quantity: number;
      price: number;
      image: string | null;
    }[] = [];

    for (const item of items as CheckoutItem[]) {
      const product = productMap.get(item.id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "One or more products are no longer available" },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.floor(item.quantity || 1));

      const unitPrice = product.discountedPrice
        ? Number(product.discountedPrice)
        : Number(product.price);
      const lineTotal = unitPrice * quantity;
      computedTotal += lineTotal;

      const defaultVariant = product.productVariants?.find((v) => v.isDefault);
      const image =
        item.image ||
        defaultVariant?.image ||
        product.images?.[0] ||
        null;

      orderItems.push({
        productId: product.id,
        productTitle: product.title,
        quantity,
        price: lineTotal,
        image,
      });
    }

    const { coupon, error: couponError } = await validateAndComputeCoupon(
      couponCode,
      computedTotal
    );
    if (couponError) {
      return NextResponse.json({ success: false, message: couponError }, { status: 400 });
    }

    const discountAmount = coupon?.discountAmount || 0;
    const finalTotal = Math.max(0, computedTotal - discountAmount);
    const paymentLabel = coupon
      ? `${paymentMethod || "cod"}|coupon:${coupon.code}|discount:${discountAmount}`
      : paymentMethod || "cod";

    const order = await prismaClientInstance.order.create({
      data: {
        userId: session.user.id,
        shippingName: String(customer.name).trim(),
        shippingEmail: String(customer.email).trim().toLowerCase(),
        shippingPhone: String(customer.phone).trim(),
        shippingAddress: String(customer.address).trim(),
        totalPrice: finalTotal,
        paymentMethod: paymentLabel,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    if (coupon?.code) {
      await markCouponUsed(coupon.code).catch((err) =>
        console.error("[coupon] mark used failed", err)
      );
    }

    void notifyOrderPlaced({
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
    }).catch((err) => console.error("[order-email] place failed", err));

    return NextResponse.json({ success: true, order, discountAmount });
  } catch (error: unknown) {
    console.error("Order creation failed", error);
    const message = error instanceof Error ? error.message : "Unable to create order";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
