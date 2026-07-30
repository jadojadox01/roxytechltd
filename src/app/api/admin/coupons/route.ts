import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaDB";
import { requireAdmin } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c: {
        id: string;
        code: string;
        discountType: string;
        discountValue: unknown;
        minOrderAmount: unknown;
        maxUses: number | null;
        usedCount: number;
        expiresAt: Date | null;
        isActive: boolean;
        createdAt: Date;
      }) => ({
        ...c,
        discountValue: Number(c.discountValue),
        minOrderAmount: c.minOrderAmount != null ? Number(c.minOrderAmount) : null,
      })),
    });
  } catch (err) {
    console.error("[coupons GET]", err);
    return NextResponse.json({ success: false, message: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    const discountValue = Number(body.discountValue);
    const minOrderAmount =
      body.minOrderAmount != null && body.minOrderAmount !== ""
        ? Number(body.minOrderAmount)
        : null;
    const maxUses =
      body.maxUses != null && body.maxUses !== "" ? Number(body.maxUses) : null;
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    const isActive = body.isActive !== false;

    if (!code || !Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid code and discount value are required" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && discountValue > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage discount cannot exceed 100" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount ?? undefined,
        maxUses: maxUses ?? undefined,
        expiresAt: expiresAt ?? undefined,
        isActive,
      },
    });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      action: "COUPON_CREATED",
      module: "COUPON",
      entityId: coupon.id,
      entityName: coupon.code,
      ...meta,
    });

    return NextResponse.json({
      success: true,
      coupon: {
        ...coupon,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null,
      },
    });
  } catch (err: unknown) {
    console.error("[coupons POST]", err);
    const message =
      err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002"
        ? "A coupon with this code already exists"
        : "Failed to create coupon";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ success: false, message: "Coupon id required" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (body.discountValue != null) data.discountValue = Number(body.discountValue);
    if (body.maxUses !== undefined) {
      data.maxUses = body.maxUses === null || body.maxUses === "" ? null : Number(body.maxUses);
    }
    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    const coupon = await prisma.coupon.update({ where: { id }, data });

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      action: "COUPON_UPDATED",
      module: "COUPON",
      entityId: coupon.id,
      entityName: coupon.code,
      ...meta,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    console.error("[coupons PATCH]", err);
    return NextResponse.json({ success: false, message: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Coupon id required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.delete({ where: { id } });
    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      action: "COUPON_DELETED",
      module: "COUPON",
      entityId: coupon.id,
      entityName: coupon.code,
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[coupons DELETE]", err);
    return NextResponse.json({ success: false, message: "Failed to delete coupon" }, { status: 500 });
  }
}
