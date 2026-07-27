"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import SingleItem from "./SingleItem";
import TestimonialsHeader from "./TestimonialsHeader";
import { useTestimonialSwiper } from "./useTestimonialSwiper";
import type { Testimonial } from "@/types/testimonial";

import "swiper/css";
import "swiper/css/navigation";

const BREAKPOINTS = {
  0: { slidesPerView: 1 },
  768: { slidesPerView: 2 },
  1200: { slidesPerView: 3 },
} as const;

const Testimonials = ({
  reviews,
  siteName,
}: {
  reviews: Testimonial[];
  siteName: string;
}) => {
  const { sliderRef, handlePrev, handleNext, onSlideChange, currentIndex } =
    useTestimonialSwiper();

  if (!reviews.length) return null;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <TestimonialsHeader
          siteName={siteName}
          onPrev={handlePrev}
          onNext={handleNext}
          isPrevDisabled={currentIndex === 0}
          isNextDisabled={currentIndex >= reviews.length - 1}
        />

        <Swiper
          className="testimonial-swiper !overflow-visible"
          ref={sliderRef}
          slidesPerView={3}
          spaceBetween={24}
          breakpoints={BREAKPOINTS}
          onSlideChange={onSlideChange}
        >
          {reviews.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <SingleItem testimonial={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Testimonials;
