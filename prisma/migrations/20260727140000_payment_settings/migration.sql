-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoPhone" TEXT;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoAccountName" TEXT;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "bankCardsEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "bankCardsMessage" TEXT DEFAULT 'Coming soon';
ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "codEnabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "SiteSetting"
SET
  "momoPhone" = COALESCE("momoPhone", '0783428632'),
  "momoAccountName" = COALESCE("momoAccountName", 'Grace NKURIKIYINKA'),
  "bankCardsMessage" = COALESCE("bankCardsMessage", 'Coming soon')
WHERE "momoPhone" IS NULL OR "momoAccountName" IS NULL OR "bankCardsMessage" IS NULL;
