import { getHeroBanners, getHeroSliders } from "@/get-api-data/hero";
import HeroSlideshow, { HeroSlide } from "./HeroSlideshow";
import HeroBannerItem from "./HeroBannerItem";
import { IHeroBanner } from "@/types/hero";

function buildSlides(
  sliders: Awaited<ReturnType<typeof getHeroSliders>>,
  banners: IHeroBanner[]
): HeroSlide[] {
  const fromSliders: HeroSlide[] = (sliders ?? []).map((s) => ({
    id: `slider-${s.id}`,
    eyebrow: s.sliderName || "Featured Deal",
    title: s.headline || s.product?.title || "Special Offer",
    description:
      s.description ||
      s.product?.shortDescription?.slice(0, 140) ||
      "Limited time offer — shop now before it's gone.",
    image: s.sliderImage,
    href: `/products/${s.product?.slug}`,
    cta: s.ctaLabel || "Shop Now",
    discount: s.discountRate,
  }));

  const fromBanners: HeroSlide[] = banners.map((b) => ({
    id: `banner-${b.id}`,
    eyebrow: b.subtitle || "Limited Offer",
    title: b.bannerName || b.product?.title || "Featured Product",
    description: "Exclusive offer available for a limited time only.",
    image: b.bannerImage,
    href: `/products/${b.product?.slug}`,
    cta: b.ctaLabel || "View Deal",
    priceLabel:
      b.product?.discountedPrice != null
        ? `From ${Number(b.product.discountedPrice).toLocaleString()} RWF`
        : null,
  }));

  return [...fromSliders, ...fromBanners];
}

const Hero = async () => {
  let banners: IHeroBanner[] = [];
  let sliders: Awaited<ReturnType<typeof getHeroSliders>> = [];

  try {
    [banners, sliders] = await Promise.all([getHeroBanners(), getHeroSliders()]);
  } catch (error) {
    console.error("[Hero]", error);
  }

  const slides = buildSlides(sliders, banners);
  if (slides.length === 0) return null;

  const sideBanners = banners.slice(0, 2);

  return (
    <section className="relative">
      <div className="pt-[7.5rem] md:pt-[8.5rem]">
        <HeroSlideshow slides={slides} />
      </div>

      {sideBanners.length > 0 && (
        <div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sideBanners.map((bannerItem) => (
              <HeroBannerItem key={bannerItem.id} bannerItem={bannerItem} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
