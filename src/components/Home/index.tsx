import Link from "next/link";
import {
  getFeaturedProducts,
  getNewArrivalsProduct,
} from "@/get-api-data/product";
import { getCategories } from "@/get-api-data/category";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getHeroSliders } from "@/get-api-data/hero";
import Newsletter from "@/components/Common/Newsletter";
import HomeHeroSlideshow from "@/components/Home/HomeHeroSlideshow";
import { prisma } from "@/lib/prismaDB";
import {
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
} from "@/lib/site-settings-db";

function ProductCard({ item }: { item: any }) {
  const image =
    item.productVariants?.find((v: { isDefault?: boolean; image?: string | null }) => v.isDefault)
      ?.image ||
    item.productVariants?.[0]?.image ||
    item.images?.[0] ||
    "/images/products/product-placeholder.svg";
  const currentPrice = Number(item.discountedPrice ?? item.price ?? 0);
  const oldPrice = Number(item.price ?? 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${item.slug}`} className="block bg-slate-100 p-6 text-center">
        <img
          src={image}
          alt={item.title}
          className="mx-auto h-36 w-full max-w-[180px] object-contain"
        />
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Live catalog
        </p>
        <Link
          href={`/products/${item.slug}`}
          className="mt-1 block text-sm font-bold text-slate-900 hover:text-[#1c2ea3]"
        >
          {item.title}
        </Link>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-base font-black text-[#ff7a1a]">
              {currentPrice.toLocaleString("en-RW")} RWF
            </p>
            {item.discountedPrice ? (
              <p className="text-xs text-slate-400 line-through">
                {oldPrice.toLocaleString("en-RW")} RWF
              </p>
            ) : null}
          </div>
          <Link
            href={`/products/${item.slug}`}
            className="rounded-lg bg-[#1c2ea3] px-3 py-2 text-xs font-bold text-white hover:bg-[#16257e]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}

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
    categories,
    productCount,
    customerCount,
    reviewStats,
    heroSliders,
  ] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(),
    getNewArrivalsProduct(),
    getCategories(),
    prisma.product.count().catch(() => 0),
    prisma.user.count({ where: { role: "USER" } }).catch(() => 0),
    prisma.review
      .aggregate({
        where: { isApproved: true },
        _count: { ratings: true },
        _avg: { ratings: true },
      })
      .catch(() => ({ _count: { ratings: 0 }, _avg: { ratings: null } })),
    getHeroSliders().catch(() => []),
  ]);

  const categoryList = categories.slice(0, 6);

  const heroTitle = siteSettings?.heroTitle?.trim() || DEFAULT_HERO_TITLE;
  const { lead: heroLead, accent: heroAccent } = splitHeroTitle(heroTitle);
  const heroSubtitle = siteSettings?.heroSubtitle?.trim() || DEFAULT_HERO_SUBTITLE;
  const heroEyebrow = siteSettings?.heroEyebrow?.trim() || "New collection";
  const rating = Number(reviewStats?._avg?.ratings || 0);
  const ratingCount = Number(reviewStats?._count?.ratings || 0);

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

          <HomeHeroSlideshow
            slides={slides}
            currency={siteSettings?.currency || "RWF"}
            ratingLabel={ratingCount > 0 ? `${rating.toFixed(1)} / 5 rating` : "Trusted quality"}
            ratingSub={
              ratingCount > 0
                ? `${ratingCount.toLocaleString("en-US")} real reviews`
                : "Growing reviews"
            }
          />
        </div>
      </section>

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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((item) => (
              <ProductCard key={item.id} item={item} />
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
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-8 xl:px-0" id="categories">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
            Shop by <span className="text-[#ff7a1a]">Category</span>
          </h2>
          <Link href="/shop-with-sidebar" className="text-sm font-bold text-[#1c2ea3] hover:underline">
            Browse shop
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#1c2ea3] hover:shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{cat.description || "Explore this category"}</p>
              <p className="mt-4 text-sm font-semibold text-[#1c2ea3]">View products →</p>
            </Link>
          ))}
        </div>
      </section>

      <Newsletter />
    </main>
  );
};

export default Home;
