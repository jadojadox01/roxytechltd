
export type IHeroSlider = {
  id: number;
  sliderName: string;
  sliderImage: string;
  discountRate: number;
  slug: string;
  productId: string;
  headline?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    price: number;
    discountedPrice?: number | null;
    title: string;
    slug: string;
    shortDescription: string;
  };
};

export type IHeroBanner = {
  id: number;
  bannerName?: string | null;
  bannerImage: string;
  subtitle?: string | null;
  slug: string;
  productId: string;
  ctaLabel?: string | null;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    price: number;
    discountedPrice?: number | null;
    title: string;
    slug: string;
  };
};
