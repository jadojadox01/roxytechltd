import { getHeroBanners } from "@/get-api-data/hero";
import PromoSlideshowClient, { PromoSlide } from "./PromoSlideshowClient";
import SectionHeader from "../shared/SectionHeader";

const ACCENTS: PromoSlide["accent"][] = ["teal", "orange", "blue"];

const PromoSlideshow = async () => {
  let banners: Awaited<ReturnType<typeof getHeroBanners>> = [];
  try {
    banners = await getHeroBanners();
  } catch (error) {
    console.error("[PromoSlideshow]", error);
  }

  if (!banners.length) return null;

  const slides: PromoSlide[] = banners.map((b, i) => ({
    id: `promo-${b.id}`,
    subtitle: b.subtitle || "Featured Deal",
    title: b.bannerName || b.product?.title || "Special Promotion",
    description:
      b.product?.title
        ? `Save on ${b.product.title} — available now while stocks last.`
        : "Exclusive offer — limited stock available.",
    image: b.bannerImage,
    href: `/products/${b.product?.slug}`,
    cta: "View Offer",
    accent: ACCENTS[i % ACCENTS.length],
  }));

  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Spotlight"
          title="Featured Deals & Promotions"
          description="Swipe through our hottest offers from the catalog."
        />
        <PromoSlideshowClient slides={slides} />
      </div>
    </section>
  );
};

export default PromoSlideshow;
