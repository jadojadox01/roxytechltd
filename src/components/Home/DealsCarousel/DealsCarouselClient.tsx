"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/product";
import "swiper/css";
import "swiper/css/navigation";

export default function DealsCarouselClient({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{
          prevEl: ".deals-prev",
          nextEl: ".deals-next",
        }}
        loop={products.length > 4}
        spaceBetween={20}
        breakpoints={{
          0: { slidesPerView: 1.2 },
          480: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="deals-product-carousel !overflow-visible"
      >
        {products.map((item) => (
          <SwiperSlide key={item.id} className="!h-auto pb-2">
            <ProductItem item={item} bgClr="white" />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        className="deals-prev absolute -left-3 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-md transition hover:border-teal hover:text-teal lg:-left-5"
        aria-label="Previous deals"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button
        className="deals-next absolute -right-3 top-[38%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-3 bg-white text-dark shadow-md transition hover:border-teal hover:text-teal lg:-right-5"
        aria-label="Next deals"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
