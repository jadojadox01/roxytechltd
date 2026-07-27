"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "swiper/css";
import Image from "next/image";
import Link from "next/link";
import { IHeroSlider } from "@/types/hero";
import { ArrowRightIcon } from "@/assets/icons";

const HeroFallback = () => (
  <div className="flex flex-col-reverse items-center gap-8 px-6 py-14 sm:flex-row sm:px-10 lg:px-14 lg:py-16">
    <div className="max-w-[480px] flex-1">
      <span className="mb-4 inline-flex items-center rounded-full bg-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal">
        Welcome
      </span>
      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-dark sm:text-4xl lg:text-5xl">
        Great Products.{" "}
        <span className="bg-gradient-to-r from-teal to-blue bg-clip-text text-transparent">
          Great Prices.
        </span>
      </h1>
      <p className="mb-8 text-base leading-relaxed text-dark-3 lg:text-lg">
        Shop the latest tech and everyday essentials — quality you can trust,
        delivered right to your door across Rwanda.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/shop-without-sidebar"
          className="group inline-flex items-center gap-2 rounded-xl bg-teal px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal/25 transition hover:bg-teal-dark hover:shadow-teal/40"
        >
          Shop Now
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/shop-with-sidebar"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-3 bg-white px-8 py-3.5 text-sm font-semibold text-dark transition hover:border-teal hover:text-teal"
        >
          Browse Categories
        </Link>
      </div>
    </div>
    <div className="relative flex flex-1 justify-center">
      <div className="absolute inset-0 rounded-full bg-teal/5 blur-2xl" />
      <Image
        src="/images/hero/hero-01.png"
        alt="Featured products"
        width={400}
        height={400}
        priority
        className="relative object-contain drop-shadow-xl transition duration-700 hover:scale-105"
      />
    </div>
  </div>
);

const HeroCarousal = ({ sliders }: { sliders: IHeroSlider[] | null }) => {
  if (!sliders || sliders.length === 0) {
    return <HeroFallback />;
  }

  return (
    <Swiper
      spaceBetween={0}
      centeredSlides
      effect="fade"
      fadeEffect={{ crossFade: true }}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination, EffectFade]}
      className="hero-carousel"
    >
      {sliders.map((slider, key) => (
        <SwiperSlide key={key}>
          <div className="flex flex-col-reverse items-center gap-6 px-6 py-10 sm:flex-row sm:px-10 lg:py-14">
            <div className="max-w-[420px] flex-1">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-yellow px-3 py-1 text-xs font-bold uppercase tracking-wide text-dark">
                  Sale
                </span>
                <span className="text-4xl font-bold text-teal sm:text-5xl">
                  {slider.discountRate}%
                </span>
                <span className="text-sm font-medium uppercase text-dark-3">Off</span>
              </div>

              <h1 className="mb-3 text-2xl font-bold leading-tight text-dark sm:text-3xl lg:text-4xl">
                <Link
                  href={`/products/${slider?.product?.slug}`}
                  className="transition hover:text-teal"
                >
                  {slider?.product?.title}
                </Link>
              </h1>

              <p className="mb-8 line-clamp-2 text-base text-dark-3">
                {slider?.product?.shortDescription?.slice(0, 120)}
              </p>

              <Link
                href={`/products/${slider?.product?.slug}`}
                className="group inline-flex items-center gap-2 rounded-xl bg-teal px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal/25 transition hover:bg-teal-dark"
              >
                Shop Now
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="relative flex flex-1 justify-center">
              <div className="absolute inset-0 rounded-full bg-teal/5 blur-2xl" />
              <Image
                src={slider?.sliderImage || "/images/products/product-placeholder.svg"}
                alt={slider?.sliderName || "Product"}
                width={340}
                height={400}
                loading="eager"
                className="relative object-contain drop-shadow-lg"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
