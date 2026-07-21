import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";


type RawHeroProduct = {
  price: { toNumber: () => number };
  discountedPrice?: { toNumber: () => number } | null;
  title: string;
  slug: string;
};

type RawHeroBanner = {
  id: number;
  bannerName?: string | null;
  bannerImage: string;
  subtitle?: string | null;
  slug: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  product: RawHeroProduct;
};

// get hero banners
export const getHeroBanners = unstable_cache(
  async () => {
    const heroBanners = (await prisma.heroBanner.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: {
            price: true,
            discountedPrice: true,
            title: true,
            slug: true
          }
        }
      }
    })) as RawHeroBanner[];

    return heroBanners.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price.toNumber(),
        discountedPrice: item.product.discountedPrice ? item.product.discountedPrice.toNumber() : null
      }
    }));
  },
  ['heroBanners'], { tags: ['heroBanners'] }
);

// get hero sliders
export const getHeroSliders = unstable_cache(
  async () => {
    type RawHeroSlider = {
      id: number;
      sliderName: string;
      sliderImage: string;
      discountRate: number;
      slug: string;
      productId: string;
      createdAt: Date;
      updatedAt: Date;
      product: RawHeroProduct & { shortDescription?: string | null };
    };

    const heroSliders = (await prisma.heroSlider.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: {
            price: true,
            discountedPrice: true,
            title: true,
            slug: true,
            shortDescription: true
          }
        }
      }
    })) as RawHeroSlider[];

    return heroSliders.map((item: RawHeroSlider) => ({
      ...item,
      product: {
        ...item.product,
        price: item.product.price.toNumber(),
        discountedPrice: item.product.discountedPrice ? item.product.discountedPrice.toNumber() : null
      }
    }))
  },
  ['heroSliders'], { tags: ['heroSliders'] }
);


// single hero banner
export const getSingleHeroBanner = async (id:number) => 
  unstable_cache(
    async () => {
      return await prisma.heroBanner.findUnique({
        where: {
          id: id
        }
      });
    },
    ['single-hero-banner'], { tags: [`single-hero-banner-${id}`] }
  )
