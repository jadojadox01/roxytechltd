import { getDealProducts } from "@/get-api-data/product";
import DealsCarouselClient from "./DealsCarouselClient";
import SectionHeader from "../shared/SectionHeader";

const DealsCarousel = async () => {
  const products = await getDealProducts();
  if (!products.length) return null;

  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Deals"
          title="Today's Best Deals"
          description="Products with active discounts from your catalog."
          href="/shop-with-sidebar"
          linkLabel="All deals"
        />
        <DealsCarouselClient products={products} />
      </div>
    </section>
  );
};

export default DealsCarousel;
