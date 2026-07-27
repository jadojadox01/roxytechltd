"use client";
import { useCallback, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { SwiperRef } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import "swiper/css";
import SingleItem from "./SingleItem";
import { Category } from "@prisma/client";

export default function CategoryCarouselArea({
  categories,
}: {
  categories: Category[];
}) {
  const sliderRef = useRef<SwiperRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEnd, setIsEnd] = useState(false);

  const handlePrev = useCallback(() => {
    sliderRef.current?.swiper?.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.swiper?.slideNext();
  }, []);

  const onSlideChange = useCallback(() => {
    const swiper = sliderRef.current?.swiper;
    if (swiper) {
      setCurrentIndex(swiper.activeIndex);
      setIsEnd(swiper.isEnd);
    }
  }, []);

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={handlePrev}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark transition hover:border-teal hover:text-teal ${
            currentIndex === 0 ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Previous categories"
          disabled={currentIndex === 0}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-3 bg-white text-dark transition hover:border-teal hover:text-teal ${
            isEnd ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Next categories"
          disabled={isEnd}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <Swiper
        ref={sliderRef}
        modules={[Autoplay]}
        autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        slidesPerView={6}
        spaceBetween={16}
        onSlideChange={onSlideChange}
        breakpoints={{
          0: { slidesPerView: 2.2 },
          640: { slidesPerView: 3.2 },
          900: { slidesPerView: 4.2 },
          1200: { slidesPerView: 6 },
        }}
        className="categories-carousel"
      >
        {categories.map((item) => (
          <SwiperSlide key={item.id}>
            <SingleItem item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
