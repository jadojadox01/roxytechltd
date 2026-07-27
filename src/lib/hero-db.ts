import { prismaClientInstance } from "@/lib/prismaDB";

export type HeroSliderRow = {
  id: number;
  sliderName: string;
  sliderImage: string;
  discountRate: number;
  slug: string;
  productId: string;
  headline: string | null;
  description: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  productTitle: string;
  productSlug: string;
  productShortDescription: string | null;
};

export type HeroBannerRow = {
  id: number;
  bannerName: string | null;
  bannerImage: string;
  subtitle: string | null;
  slug: string;
  productId: string;
  ctaLabel: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  productTitle: string;
  productSlug: string;
  productPrice: unknown;
  productDiscountedPrice: unknown;
};

export async function listHeroSlidersAdmin() {
  return prismaClientInstance.$queryRaw<HeroSliderRow[]>`
    SELECT
      hs.id,
      hs."sliderName",
      hs."sliderImage",
      hs."discountRate",
      hs.slug,
      hs."productId",
      hs.headline,
      hs.description,
      hs."ctaLabel",
      hs."sortOrder",
      hs."createdAt",
      hs."updatedAt",
      p.title AS "productTitle",
      p.slug AS "productSlug",
      p."shortDescription" AS "productShortDescription"
    FROM "HeroSlider" hs
    INNER JOIN "Product" p ON p.id = hs."productId"
    ORDER BY hs."sortOrder" ASC, hs."updatedAt" DESC
  `;
}

export async function listHeroSlidersPublic() {
  return listHeroSlidersAdmin();
}

export async function createHeroSlider(data: {
  sliderName: string;
  sliderImage: string;
  discountRate: number;
  slug: string;
  productId: string;
  headline: string | null;
  description: string | null;
  ctaLabel: string;
  sortOrder: number;
}) {
  const rows = await prismaClientInstance.$queryRaw<
    {
      id: number;
      sliderName: string;
      sliderImage: string;
      discountRate: number;
      slug: string;
      productId: string;
      headline: string | null;
      description: string | null;
      ctaLabel: string | null;
      sortOrder: number;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >`
    INSERT INTO "HeroSlider" (
      "sliderName", "sliderImage", "discountRate", slug, "productId",
      headline, description, "ctaLabel", "sortOrder", "createdAt", "updatedAt"
    )
    VALUES (
      ${data.sliderName},
      ${data.sliderImage},
      ${data.discountRate},
      ${data.slug},
      ${data.productId},
      ${data.headline},
      ${data.description},
      ${data.ctaLabel},
      ${data.sortOrder},
      NOW(),
      NOW()
    )
    RETURNING id, "sliderName", "sliderImage", "discountRate", slug, "productId",
      headline, description, "ctaLabel", "sortOrder", "createdAt", "updatedAt"
  `;
  return rows[0];
}

export async function deleteHeroSlider(id: number) {
  await prismaClientInstance.$executeRaw`DELETE FROM "HeroSlider" WHERE id = ${id}`;
}

export async function listHeroBannersAdmin() {
  return prismaClientInstance.$queryRaw<HeroBannerRow[]>`
    SELECT
      hb.id,
      hb."bannerName",
      hb."bannerImage",
      hb.subtitle,
      hb.slug,
      hb."productId",
      hb."ctaLabel",
      hb."sortOrder",
      hb."createdAt",
      hb."updatedAt",
      p.title AS "productTitle",
      p.slug AS "productSlug",
      p.price AS "productPrice",
      p."discountedPrice" AS "productDiscountedPrice"
    FROM "HeroBanner" hb
    INNER JOIN "Product" p ON p.id = hb."productId"
    ORDER BY hb."sortOrder" ASC, hb."updatedAt" DESC
  `;
}

export async function listHeroBannersPublic() {
  return listHeroBannersAdmin();
}

export async function createHeroBanner(data: {
  bannerName: string;
  bannerImage: string;
  subtitle: string | null;
  slug: string;
  productId: string;
  ctaLabel: string;
  sortOrder: number;
}) {
  const rows = await prismaClientInstance.$queryRaw<
    {
      id: number;
      bannerName: string | null;
      bannerImage: string;
      subtitle: string | null;
      slug: string;
      productId: string;
      ctaLabel: string | null;
      sortOrder: number;
      createdAt: Date;
      updatedAt: Date;
    }[]
  >`
    INSERT INTO "HeroBanner" (
      "bannerName", "bannerImage", subtitle, slug, "productId",
      "ctaLabel", "sortOrder", "createdAt", "updatedAt"
    )
    VALUES (
      ${data.bannerName},
      ${data.bannerImage},
      ${data.subtitle},
      ${data.slug},
      ${data.productId},
      ${data.ctaLabel},
      ${data.sortOrder},
      NOW(),
      NOW()
    )
    RETURNING id, "bannerName", "bannerImage", subtitle, slug, "productId",
      "ctaLabel", "sortOrder", "createdAt", "updatedAt"
  `;
  return rows[0];
}

export async function deleteHeroBanner(id: number) {
  await prismaClientInstance.$executeRaw`DELETE FROM "HeroBanner" WHERE id = ${id}`;
}
