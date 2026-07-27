-- Run against your Neon/production database to sync missing schema.
-- PowerShell: node scripts/run-patch-neon.js

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STORE_KEEPER';

DO $$ BEGIN
  CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN NOT NULL DEFAULT true;

DO $$ BEGIN
  CREATE TYPE "OrderStatus_new" AS ENUM (
    'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'OrderStatus' AND e.enumlabel = 'APPROVED'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'OrderStatus' AND e.enumlabel = 'CONFIRMED'
  ) THEN
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
  END IF;
END $$;

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

CREATE TABLE IF NOT EXISTS "Inventory" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "currentStock" INTEGER NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Inventory_productId_key" ON "Inventory"("productId");

INSERT INTO "Inventory" ("id", "productId", "currentStock", "lowStockThreshold", "updatedAt")
SELECT gen_random_uuid()::text, "id", "quantity", 5, NOW()
FROM "Product"
WHERE "id" NOT IN (SELECT "productId" FROM "Inventory")
ON CONFLICT DO NOTHING;
