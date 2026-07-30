import Link from "next/link";
import {
  getFeaturedProducts,
  getNewArrivalsProduct,
} from "@/get-api-data/product";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getHeroSliders } from "@/get-api-data/hero";
import Newsletter from "@/components/Common/Newsletter";
import ProductItem from "@/components/Common/ProductItem";
import HomeHeroSlideshow from "@/components/Home/HomeHeroSlideshow";
import CategoryGrid from "@/components/Home/Categories/CategoryGrid";
import { prisma } from "@/lib/prismaDB";
import {
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
} from "@/lib/site-settings-db";
import type { Product } from "@/types/product";

function splitHeroTitle(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return { lead: title, accent: "" };
  }
  return {
    lead: words.slice(0, -2).join(" "),
    accent: words.slice(-2).join(" "),
  };
}

const Home = async () => {
  const [
    siteSettings,
    featuredProducts,
    newArrivalProducts,
    productCount,
    customerCount,
    heroSliders,
  ] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
    getNewArrivalsProduct(),
    prisma.product.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    getHeroSliders().catch(() => []),
  ]);

  const heroTitle = siteSettings?.heroTitle?.trim() || DEFAULT_HERO_TITLE;
  const { lead: heroLead, accent: heroAccent } = splitHeroTitle(heroTitle);
  const heroSubtitle = siteSettings?.heroSubtitle?.trim() || DEFAULT_HERO_SUBTITLE;
  const heroEyebrow = siteSettings?.heroEyebrow?.trim() || "New collection";

  const slides = (heroSliders || []).map((slide) => ({
    id: slide.id,
    sliderName: slide.sliderName,
    sliderImage: slide.sliderImage,
    headline: slide.headline,
    description: slide.description,
    ctaLabel: slide.ctaLabel,
    discountRate: slide.discountRate,
    productSlug: slide.productSlug || slide.product?.slug || null,
  }));

  return (
    <main className="bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1a255f] via-[#2b2f72] to-[#f06a16] pt-36 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#1c2ea3]/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#ff7a1a]/35 to-transparent" />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-16 sm:px-8 lg:grid-cols-2 xl:px-0">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/95">
              <span className="h-2 w-2 rounded-full bg-[#ffb67a]" />
              {heroEyebrow}
            </div>
            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
              {heroLead}
              {heroAccent ? (
                <>
                  <br />
                  <span className="text-[#ffb67a]">{heroAccent}</span>
                </>
              ) : null}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/90 md:text-base">{heroSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop-without-sidebar"
                className="inline-flex items-center rounded-lg bg-[#ff7a1a] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#e7680d]"
              >
                Shop Now
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-lg border border-white/60 bg-transparent px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 text-left sm:max-w-lg">
              <div>
                <div className="text-3xl font-black text-white">{productCount.toLocaleString("en-US")}+</div>
                <div className="text-sm text-white/80">Products</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">{customerCount.toLocaleString("en-US")}+</div>
                <div className="text-sm text-white/80">Happy customers</div>
              </div>
              <div>
                <div className="text-3xl font-black text-white">24h</div>
                <div className="text-sm text-white/80">Kigali delivery</div>
              </div>
            </div>
          </div>

          <HomeHeroSlideshow slides={slides} />
        </div>
      </section>

      <CategoryGrid />

      <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-8 xl:px-0" id="products">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            Featured <span className="text-[#ff7a1a]">Products</span>
          </h2>
          <Link href="/shop-with-sidebar" className="text-sm font-bold text-[#1c2ea3] hover:underline">
            See all products
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((item) => (
              <ProductItem key={item.id} item={item as Product} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No products yet. Add products in Admin → Products.
          </p>
        )}
      </section>

      {newArrivalProducts.length > 0 ? (
        <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-8 xl:px-0" id="new-arrivals">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
              New <span className="text-[#ff7a1a]">Arrivals</span>
            </h2>
            <Link
              href="/shop-without-sidebar"
              className="text-sm font-bold text-[#1c2ea3] hover:underline"
            >
              See all products
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newArrivalProducts.map((item) => (
              <ProductItem key={item.id} item={item as Product} />
            ))}
          </div>
        </section>
      ) : null}

      <Newsletter />
    </main>
  );
};

export default Home;
