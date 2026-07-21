"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";
import { IHeroSlider } from "@/types/hero";

const HeroFallback = () => (
  <div className="flex flex-col-reverse items-center gap-6 px-4 py-12 sm:flex-row sm:px-7.5 sm:py-16 lg:px-12.5">
    <div className="max-w-[440px]">
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-yellow text-dark">
        Deals of the day
      </span>
      <h1 className="mb-4 text-3xl font-bold leading-tight text-dark sm:text-4xl lg:text-5xl">
        Great Products. <span className="text-blue">Great Prices.</span>
      </h1>
      <p className="mb-8 text-base text-dark-3">
        Shop the latest tech and everyday essentials — quality you can
        trust, delivered right to your door.
      </p>
      <Link
        href="/shop-without-sidebar"
        className="inline-flex px-8 py-3 font-medium text-white duration-200 ease-out rounded-lg text-custom-sm bg-blue hover:bg-blue-dark"
      >
        Shop Now
      </Link>
    </div>
    <div className="flex justify-center flex-1">
      <Image
        src="/images/hero/hero-01.png"
        alt="Featured products"
        width={360}
        height={360}
        priority
        className="object-contain"
      />
    </div>
  </div>
);

const HeroCarousal = ({ sliders }: { sliders: any }) => {
  if (!sliders || sliders.length === 0) {
    return <HeroFallback />;
  }

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {sliders?.map((slider: IHeroSlider, key: number) => (
        <SwiperSlide key={key}>
          <div className="flex flex-col-reverse items-center pt-6 sm:pt-0 sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-5">
                <span className="block font-semibold text-heading-3 sm:text-[58px] text-blue">
                  {slider?.discountRate}%
                </span>
                <span className="block text-sm uppercase text-dark sm:text-xl sm:leading-6">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              <h1 className="mb-3 text-xl font-semibold text-dark sm:text-3xl">
                <Link href={`/products/${slider?.product?.slug}`}>
                  {slider?.product?.title}
                </Link>
              </h1>

              <p className="text-base text-meta-3">
                {slider?.product?.shortDescription?.slice(0, 100)}
              </p>

              <Link
                href={`/products/${slider?.product?.slug}`}
                className="inline-flex py-3 mt-10 font-medium text-white duration-200 ease-out rounded-lg text-custom-sm bg-blue px-9 hover:bg-blue-dark"
              >
                Shop Now
              </Link>
            </div>

            <div>
              <Image
                src={slider?.sliderImage ? slider?.sliderImage! : "/no image"}
                alt="headphone"
                width={320}
                height={400}
                loading="eager"
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
