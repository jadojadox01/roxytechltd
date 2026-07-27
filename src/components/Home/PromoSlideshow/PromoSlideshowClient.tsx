"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { ArrowRightIcon } from "@/assets/icons";
import "swiper/css";
import "swiper/css/pagination";

export type PromoSlide = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  href: string;
  cta: string;
  accent: "teal" | "orange" | "blue";
};

const accentMap = {
  teal: {
    bg: "from-teal/20 via-teal/5 to-white",
    badge: "bg-teal/10 text-teal",
    btn: "bg-teal hover:bg-teal-dark",
  },
  orange: {
    bg: "from-orange/20 via-orange/5 to-white",
    badge: "bg-orange/10 text-orange",
    btn: "bg-orange hover:bg-orange-dark",
  },
  blue: {
    bg: "from-blue/20 via-blue/5 to-white",
    badge: "bg-blue/10 text-blue",
    btn: "bg-blue hover:bg-blue-dark",
  },
};

export default function PromoSlideshowClient({ slides }: { slides: PromoSlide[] }) {
  if (!slides.length) return null;

  return (
    <div className="promo-slideshow overflow-hidden rounded-2xl border border-gray-3/60 shadow-lg shadow-teal/5">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        spaceBetween={0}
      >
        {slides.map((slide) => {
          const accent = accentMap[slide.accent];
          return (
            <SwiperSlide key={slide.id}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${accent.bg}`}>
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/40 blur-2xl" />
                <div className="relative grid items-center gap-6 px-6 py-10 sm:grid-cols-2 sm:px-10 sm:py-14 lg:px-16">
                  <div className="order-2 sm:order-1">
                    <span className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${accent.badge}`}>
                      {slide.subtitle}
                    </span>
                    <h2 className="mb-3 text-2xl font-bold text-dark sm:text-3xl lg:text-4xl">
                      {slide.title}
                    </h2>
                    <p className="mb-6 max-w-md text-sm leading-relaxed text-dark-3 sm:text-base">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.href}
                      className={`group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition ${accent.btn}`}
                    >
                      {slide.cta}
                      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="order-1 flex justify-center sm:order-2">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      width={360}
                      height={360}
                      className="max-h-[260px] w-auto object-contain drop-shadow-xl transition duration-500 hover:scale-105 sm:max-h-[320px]"
                    />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
