import { prisma } from "@/lib/prismaDB";

export type AppliedCoupon = {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
};

export async function validateAndComputeCoupon(
  codeRaw: string | null | undefined,
  subtotal: number
): Promise<{ coupon: AppliedCoupon | null; error: string | null }> {
  const code = String(codeRaw || "").trim().toUpperCase();
  if (!code) return { coupon: null, error: null };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) {
    return { coupon: null, error: "Invalid or inactive coupon" };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { coupon: null, error: "This coupon has expired" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { coupon: null, error: "This coupon has reached its usage limit" };
  }

  const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : 0;
  if (subtotal < minOrder) {
    return {
      coupon: null,
      error: `Minimum order amount is ${minOrder.toLocaleString("en-RW")} RWF`,
    };
  }

  const discountValue = Number(coupon.discountValue);
  let discountAmount =
    coupon.discountType === "fixed" ? discountValue : (subtotal * discountValue) / 100;
  discountAmount = Math.min(Math.max(0, discountAmount), subtotal);

  return {
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue,
      discountAmount,
    },
    error: null,
  };
}

export async function markCouponUsed(code: string) {
  await prisma.coupon.update({
    where: { code },
    data: { usedCount: { increment: 1 } },
  });
}
