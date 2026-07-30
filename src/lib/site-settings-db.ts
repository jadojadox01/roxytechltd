import { prismaClientInstance } from "@/lib/prismaDB";

const DEFAULT_HERO_TITLE = "Elevate Your Shopping Journey";
const DEFAULT_HERO_SUBTITLE =
  "Premium stationery, school & office materials — everything you need, all in one shop. Fast delivery across Rwanda.";

export type SiteSettingsRow = {
  id: string;
  about: string | null;
  mission: string | null;
  vision: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  currency: string;
  momoPhone: string | null;
  momoAccountName: string | null;
  momoEnabled: boolean;
  bankCardsEnabled: boolean;
  bankCardsMessage: string | null;
  codEnabled: boolean;
  heroEyebrow: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
};

let schemaReady: Promise<void> | null = null;

/** Ensures payment + hero columns exist (handles Neon schema drift). */
export function ensureSiteSettingSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const statements = [
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoPhone" TEXT`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoAccountName" TEXT`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "momoEnabled" BOOLEAN NOT NULL DEFAULT true`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "bankCardsEnabled" BOOLEAN NOT NULL DEFAULT false`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "bankCardsMessage" TEXT DEFAULT 'Coming soon'`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "codEnabled" BOOLEAN NOT NULL DEFAULT true`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "heroEyebrow" TEXT DEFAULT 'New collection'`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "heroTitle" TEXT DEFAULT '${DEFAULT_HERO_TITLE.replace(/'/g, "''")}'`,
        `ALTER TABLE "SiteSetting" ADD COLUMN IF NOT EXISTS "heroSubtitle" TEXT DEFAULT '${DEFAULT_HERO_SUBTITLE.replace(/'/g, "''")}'`,
        `ALTER TABLE "HeroSlider" ALTER COLUMN "productId" DROP NOT NULL`,
      ];
      for (const sql of statements) {
        try {
          await prismaClientInstance.$executeRawUnsafe(sql);
        } catch {
          // Ignore if table not ready yet; create path below handles empty DB
        }
      }
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

export async function getOrCreateSiteSettings(): Promise<SiteSettingsRow> {
  await ensureSiteSettingSchema();

  const existing = await prismaClientInstance.$queryRawUnsafe<SiteSettingsRow[]>(
    `SELECT id, about, mission, vision, "contactPhone", "contactEmail", "contactAddress",
            "facebookUrl", "twitterUrl", "instagramUrl", "linkedinUrl", currency,
            "momoPhone", "momoAccountName", "momoEnabled", "bankCardsEnabled",
            "bankCardsMessage", "codEnabled",
            "heroEyebrow", "heroTitle", "heroSubtitle"
     FROM "SiteSetting"
     ORDER BY "createdAt" ASC
     LIMIT 1`
  );

  if (existing[0]) return existing[0];

  const created = await prismaClientInstance.$queryRawUnsafe<SiteSettingsRow[]>(
    `INSERT INTO "SiteSetting" (id, currency, "momoEnabled", "bankCardsEnabled", "codEnabled",
      "heroEyebrow", "heroTitle", "heroSubtitle", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, 'RWF', true, false, true,
      'New collection', $1, $2, NOW(), NOW())
     RETURNING id, about, mission, vision, "contactPhone", "contactEmail", "contactAddress",
       "facebookUrl", "twitterUrl", "instagramUrl", "linkedinUrl", currency,
       "momoPhone", "momoAccountName", "momoEnabled", "bankCardsEnabled",
       "bankCardsMessage", "codEnabled",
       "heroEyebrow", "heroTitle", "heroSubtitle"`,
    DEFAULT_HERO_TITLE,
    DEFAULT_HERO_SUBTITLE
  );

  return created[0];
}

export async function updateSiteSettings(
  id: string,
  data: Partial<SiteSettingsRow> & { currency?: string }
): Promise<SiteSettingsRow> {
  await ensureSiteSettingSchema();

  await prismaClientInstance.$executeRawUnsafe(
    `UPDATE "SiteSetting" SET
      about = $1,
      mission = $2,
      vision = $3,
      "contactPhone" = $4,
      "contactEmail" = $5,
      "contactAddress" = $6,
      "facebookUrl" = $7,
      "twitterUrl" = $8,
      "instagramUrl" = $9,
      "linkedinUrl" = $10,
      currency = $11,
      "momoPhone" = $12,
      "momoAccountName" = $13,
      "momoEnabled" = $14,
      "bankCardsEnabled" = $15,
      "bankCardsMessage" = $16,
      "codEnabled" = $17,
      "heroEyebrow" = $18,
      "heroTitle" = $19,
      "heroSubtitle" = $20,
      "updatedAt" = NOW()
     WHERE id = $21`,
    data.about ?? null,
    data.mission ?? null,
    data.vision ?? null,
    data.contactPhone ?? null,
    data.contactEmail ?? null,
    data.contactAddress ?? null,
    data.facebookUrl ?? null,
    data.twitterUrl ?? null,
    data.instagramUrl ?? null,
    data.linkedinUrl ?? null,
    data.currency || "RWF",
    data.momoPhone ?? null,
    data.momoAccountName ?? null,
    data.momoEnabled !== false,
    data.bankCardsEnabled === true,
    data.bankCardsMessage ?? "Coming soon",
    data.codEnabled !== false,
    data.heroEyebrow ?? "New collection",
    data.heroTitle ?? DEFAULT_HERO_TITLE,
    data.heroSubtitle ?? DEFAULT_HERO_SUBTITLE,
    id
  );

  return getOrCreateSiteSettings();
}

export { DEFAULT_HERO_TITLE, DEFAULT_HERO_SUBTITLE };
