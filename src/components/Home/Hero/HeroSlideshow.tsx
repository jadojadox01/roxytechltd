"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@/assets/icons";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
  discount?: number | null;
  priceLabel?: string | null;
};

export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  if (!slides.length) return null;

  return (
    <div className="group/hero relative">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          prevEl: ".hero-prev",
          nextEl: ".hero-next",
        }}
        loop={slides.length > 1}
        className="hero-full-slideshow"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-blue via-blue-dark to-dark sm:min-h-[480px] lg:min-h-[540px]">
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={slide.id === slides[0].id}
                  className="object-cover opacity-30 mix-blend-luminosity"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
              </div>

              <div className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-teal/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-1/4 h-64 w-64 rounded-full bg-yellow/10 blur-3xl" />

              <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 py-16 sm:px-8 lg:py-20 xl:px-0">
                <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="max-w-xl">
                    {slide.discount != null && slide.discount > 0 && (
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow px-4 py-1.5">
                        <span className="text-2xl font-black text-dark">{slide.discount}%</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-dark">Off Today</span>
                      </div>
                    )}
                    <span className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                      {slide.eyebrow}
                    </span>
                    <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mb-2 text-base leading-relaxed text-white/75 sm:text-lg">
                      {slide.description}
                    </p>
                    {slide.priceLabel && (
                      <p className="mb-6 text-xl font-bold text-yellow">{slide.priceLabel}</p>
                    )}
                    <Link
                      href={slide.href}
                      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal to-blue px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-teal/30 transition hover:shadow-teal/50"
                    >
                      {slide.cta}
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="relative hidden justify-center lg:flex">
                    <div className="absolute inset-0 rounded-full bg-teal/10 blur-3xl" />
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={480}
                      height={480}
                      className="relative max-h-[380px] w-auto object-contain drop-shadow-2xl transition duration-700 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="hero-prev absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 lg:left-8"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hero-next absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 lg:right-8"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
