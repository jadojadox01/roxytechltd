import { NextRequest, NextResponse } from "next/server";
import { prismaClientInstance } from "@/lib/prismaDB";
import { requireStaff } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  try {
    const inventory = await prismaClientInstance.product.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        slug: true,
        quantity: true,
        price: true,
        sku: true,
        status: true,
        isAvailable: true,
        category: { select: { title: true } },
        inventory: true,
        stockMovements: {
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            performedBy: { select: { name: true, email: true } },
            supplier: { select: { name: true } },
          },
        },
      },
    });

    const lowStock = inventory.filter(
      (p) => p.quantity <= (p.inventory?.lowStockThreshold ?? 5)
    );

    return NextResponse.json({ success: true, inventory, lowStock });
  } catch (err: unknown) {
    console.error("Inventory fetch error:", err);
    return NextResponse.json({ success: false, message: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireStaff();
  if (error) return error;

  try {
    const body = await req.json();
    const { productId, type, quantity, reason, supplierId, supplierName } = body;

    if (!productId || !type || !quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "productId, type, and positive quantity required" },
        { status: 400 }
      );
    }

    const product = await prismaClientInstance.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const previousStock = product.quantity;
    let newStock = previousStock;

    if (type === "STOCK_IN") {
      newStock = previousStock + quantity;
    } else if (type === "STOCK_OUT" || type === "ORDER_FULFILLMENT") {
      if (previousStock < quantity) {
        return NextResponse.json({ success: false, message: "Insufficient stock" }, { status: 400 });
      }
      newStock = previousStock - quantity;
    } else if (type === "ADJUSTMENT") {
      newStock = quantity;
    }

    let resolvedSupplierId = supplierId || null;
    if (supplierName && !supplierId) {
      const supplier = await prismaClientInstance.supplier.create({
        data: { name: supplierName },
      });
      resolvedSupplierId = supplier.id;
    }

    const [updatedProduct, movement] = await prismaClientInstance.$transaction([
      prismaClientInstance.product.update({
        where: { id: productId },
        data: {
          quantity: newStock,
          status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
          isAvailable: newStock > 0,
        },
      }),
      prismaClientInstance.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          previousStock,
          newStock,
          reason: reason || null,
          supplierId: resolvedSupplierId,
          performedById: session!.user.id,
        },
      }),
      prismaClientInstance.inventory.upsert({
        where: { productId },
        update: { currentStock: newStock },
        create: { productId, currentStock: newStock },
      }),
    ]);

    const meta = getRequestMeta(req);
    const actionLabel = type === "STOCK_IN" ? "STOCK_IN" : type === "STOCK_OUT" ? "STOCK_OUT" : "STOCK_ADJUSTED";

    await logActivity({
      userId: session!.user.id,
      userName: session!.user.name || session!.user.email,
      userRole: session!.user.role,
      action: actionLabel,
      module: "INVENTORY",
      entityId: productId,
      entityName: product.title,
      description: `${type === "STOCK_IN" ? "Added" : type === "STOCK_OUT" ? "Removed" : "Adjusted"} stock for ${product.title}`,
      oldValue: { quantity: previousStock },
      newValue: { quantity: newStock, movementQuantity: quantity, reason },
      ...meta,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      movement,
    });
  } catch (err: unknown) {
    console.error("Stock movement error:", err);
    return NextResponse.json({ success: false, message: "Failed to update stock" }, { status: 500 });
  }
}
