import { unstable_cache } from "next/cache";
import { listHeroBannersPublic, listHeroSlidersPublic } from "@/lib/hero-db";

export const getHeroBanners = unstable_cache(
  async () => {
    const rows = await listHeroBannersPublic();
    return rows.map((item) => ({
      id: item.id,
      bannerName: item.bannerName,
      bannerImage: item.bannerImage,
      subtitle: item.subtitle,
      slug: item.slug,
      productId: item.productId,
      ctaLabel: item.ctaLabel,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        title: item.productTitle,
        slug: item.productSlug,
        price: Number(item.productPrice),
        discountedPrice:
          item.productDiscountedPrice != null ? Number(item.productDiscountedPrice) : null,
      },
    }));
  },
  ["heroBanners"],
  { tags: ["heroBanners"] }
);

export const getHeroSliders = unstable_cache(
  async () => {
    const rows = await listHeroSlidersPublic();
    return rows.map((item) => ({
      id: item.id,
      sliderName: item.sliderName,
      sliderImage: item.sliderImage,
      discountRate: item.discountRate,
      slug: item.slug,
      productId: item.productId,
      headline: item.headline,
      description: item.description,
      ctaLabel: item.ctaLabel,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      product: {
        title: item.productTitle || item.sliderName,
        slug: item.productSlug || "",
        shortDescription: item.productShortDescription,
        price: 0,
        discountedPrice: null,
      },
      productSlug: item.productSlug,
    }));
  },
  ["heroSliders"],
  { tags: ["heroSliders"] }
);

export const getSingleHeroBanner = async (id: number) =>
  unstable_cache(
    async () => {
      const { prismaClientInstance } = await import("@/lib/prismaDB");
      return prismaClientInstance.heroBanner.findUnique({
        where: { id },
      });
    },
    ["single-hero-banner"],
    { tags: [`single-hero-banner-${id}`] }
  );
