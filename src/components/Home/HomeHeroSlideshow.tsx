"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type HomeHeroSlide = {
  id: number;
  sliderName: string;
  sliderImage: string;
  headline: string | null;
  description: string | null;
  ctaLabel: string | null;
  discountRate: number;
  productSlug: string | null;
};

type TrustChip = {
  title: string;
  text: string;
  position: string;
};

type Props = {
  slides: HomeHeroSlide[];
  currency: string;
  ratingLabel: string;
  ratingSub: string;
};

export default function HomeHeroSlideshow({
  slides,
  currency,
  ratingLabel,
  ratingSub,
}: Props) {
  const [index, setIndex] = useState(0);
  const hasSlides = slides.length > 0;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const chips: TrustChip[] = [
    {
      title: "Free delivery",
      text: `Orders above 20k ${currency}`,
      position: "left-3 top-4 sm:left-5 sm:top-6",
    },
    {
      title: "MTN MoMo & Card",
      text: "Accepted payments",
      position: "left-3 top-1/2 -translate-y-1/2 sm:left-5",
    },
    {
      title: ratingLabel,
      text: ratingSub,
      position: "right-3 bottom-5 sm:right-5 sm:bottom-8",
    },
  ];

  const active = hasSlides ? slides[index] : null;
  const href = active?.productSlug
    ? `/products/${active.productSlug}`
    : "/shop-without-sidebar";

  return (
    <div className="relative flex min-h-[360px] items-center justify-center md:min-h-[420px]">
      <div className="absolute h-72 w-72 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-2xl backdrop-blur-sm">
        <div className="relative aspect-[4/3] w-full bg-[#0f1e4a]/40">
          {active ? (
            <>
              <Image
                key={active.id}
                src={active.sliderImage}
                alt={active.headline || active.sliderName}
                fill
                priority
                className="object-cover transition-opacity duration-700"
                sizes="(max-width: 768px) 100vw, 520px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e4a]/80 via-[#0f1e4a]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                {active.discountRate > 0 ? (
                  <span className="mb-2 inline-flex rounded-full bg-[#ff7a1a] px-2.5 py-0.5 text-[11px] font-bold">
                    {active.discountRate}% OFF
                  </span>
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                  {active.sliderName}
                </p>
                <h3 className="mt-1 text-xl font-black leading-snug">
                  {active.headline || active.sliderName}
                </h3>
                {active.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-white/85">{active.description}</p>
                ) : null}
                <Link
                  href={href}
                  className="mt-3 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#1c2ea3] transition hover:bg-[#fff1e5]"
                >
                  {active.ctaLabel || "Shop Now"}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white/90">
              <p className="text-lg font-bold">Hero slideshow</p>
              <p className="text-sm text-white/70">
                Add sliding images from Admin → Hero to fill this panel.
              </p>
            </div>
          )}
        </div>

        {slides.length > 1 ? (
          <div className="flex items-center justify-center gap-2 bg-white/10 px-4 py-3">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-7 bg-[#ff7a1a]" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {chips.map((chip) => (
        <div
          key={chip.title}
          className={`absolute z-20 rounded-xl border border-white/30 bg-white/95 px-4 py-2 text-slate-800 shadow-lg ${chip.position}`}
        >
          <p className="text-sm font-bold">{chip.title}</p>
          <p className="text-xs text-slate-500">{chip.text}</p>
        </div>
      ))}
    </div>
  );
}
