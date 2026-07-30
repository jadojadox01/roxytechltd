import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);

    if (!code) {
      return NextResponse.json({ success: false, message: "Enter a coupon code" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, message: "Invalid or inactive coupon" }, { status: 404 });
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ success: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ success: false, message: "This coupon has reached its usage limit" }, { status: 400 });
    }

    const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : 0;
    if (subtotal < minOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum order amount is ${minOrder.toLocaleString("en-RW")} RWF`,
        },
        { status: 400 }
      );
    }

    const discountValue = Number(coupon.discountValue);
    let discountAmount =
      coupon.discountType === "fixed"
        ? discountValue
        : (subtotal * discountValue) / 100;

    discountAmount = Math.min(Math.max(0, discountAmount), subtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue,
        discountAmount,
      },
    });
  } catch (err) {
    console.error("[coupons/validate]", err);
    return NextResponse.json({ success: false, message: "Failed to validate coupon" }, { status: 500 });
  }
}
