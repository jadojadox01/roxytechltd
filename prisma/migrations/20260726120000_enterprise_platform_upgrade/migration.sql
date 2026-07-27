-- Migration: Enterprise platform upgrade
-- Adds STORE_KEEPER role, new order workflow, activity logs, inventory, and more

-- Add STORE_KEEPER to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STORE_KEEPER';

-- Migrate OrderStatus: APPROVED -> CONFIRMED, add new statuses
-- First create new enum type
DO $$ BEGIN
  CREATE TYPE "OrderStatus_new" AS ENUM (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Migrate existing orders
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'APPROVED' THEN 'CONFIRMED'::"OrderStatus_new"
    WHEN 'PENDING' THEN 'PENDING'::"OrderStatus_new"
    WHEN 'REJECTED' THEN 'REJECTED'::"OrderStatus_new"
    ELSE 'PENDING'::"OrderStatus_new"
  END
);
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE IF EXISTS "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- ProductStatus enum
DO $$ BEGIN
  CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- StockMovementType enum
DO $$ BEGIN
  CREATE TYPE "StockMovementType" AS ENUM ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'ORDER_FULFILLMENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ActivityLog
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "userName" TEXT,
  "userRole" TEXT,
  "action" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "entityId" TEXT,
  "entityName" TEXT,
  "description" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX IF NOT EXISTS "ActivityLog_module_idx" ON "ActivityLog"("module");
CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action");
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

ALTER TABLE "ActivityLog" DROP CONSTRAINT IF EXISTS "ActivityLog_userId_fkey";
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Permission tables
CREATE TABLE IF NOT EXISTS "Permission" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "module" TEXT NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_name_key" ON "Permission"("name");

CREATE TABLE IF NOT EXISTS "RolePermission" (
  "id" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "RolePermission_role_permissionId_key" ON "RolePermission"("role", "permissionId");

ALTER TABLE "RolePermission" DROP CONSTRAINT IF EXISTS "RolePermission_permissionId_fkey";
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supplier
CREATE TABLE IF NOT EXISTS "Supplier" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- Inventory
CREATE TABLE IF NOT EXISTS "Inventory" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "currentStock" INTEGER NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Inventory_productId_key" ON "Inventory"("productId");

ALTER TABLE "Inventory" DROP CONSTRAINT IF EXISTS "Inventory_productId_fkey";
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- StockMovement
CREATE TABLE IF NOT EXISTS "StockMovement" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "type" "StockMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "previousStock" INTEGER NOT NULL,
  "newStock" INTEGER NOT NULL,
  "reason" TEXT,
  "supplierId" TEXT,
  "orderId" TEXT,
  "performedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StockMovement_productId_idx" ON "StockMovement"("productId");
CREATE INDEX IF NOT EXISTS "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- ProductImage
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProductImage" DROP CONSTRAINT IF EXISTS "ProductImage_productId_fkey";
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Cart & Wishlist
CREATE TABLE IF NOT EXISTS "Cart" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_userId_key" ON "Cart"("userId");

CREATE TABLE IF NOT EXISTS "CartItem" (
  "id" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

CREATE TABLE IF NOT EXISTS "Wishlist" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_key" ON "Wishlist"("userId");

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  "id" TEXT NOT NULL,
  "wishlistId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_wishlistId_productId_key" ON "WishlistItem"("wishlistId", "productId");

-- Payment
CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" DECIMAL(65,30) NOT NULL,
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "transactionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Coupon
CREATE TABLE IF NOT EXISTS "Coupon" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "discountType" TEXT NOT NULL,
  "discountValue" DECIMAL(65,30) NOT NULL,
  "minOrderAmount" DECIMAL(65,30),
  "maxUses" INTEGER,
  "usedCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

-- Notification
CREATE TABLE IF NOT EXISTS "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- Sync inventory from existing product quantities
INSERT INTO "Inventory" ("id", "productId", "currentStock", "lowStockThreshold", "updatedAt")
SELECT gen_random_uuid()::text, "id", "quantity", 5, NOW()
FROM "Product"
WHERE "id" NOT IN (SELECT "productId" FROM "Inventory")
ON CONFLICT DO NOTHING;
