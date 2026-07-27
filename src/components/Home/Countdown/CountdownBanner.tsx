"use client";
import Image from "next/image";
import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";
import { Countdown } from "@prisma/client";
import { ClockIcon } from "@/assets/icons/home";
import { ArrowRightIcon } from "@/assets/icons";

interface CountdownBannerProps {
  data: Countdown & { product: { title: string } };
}

const CountdownBanner = ({ data }: CountdownBannerProps) => {
  if (!data) return null;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark via-dark-2 to-teal-dark p-6 sm:p-10 lg:p-14">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue/20 blur-3xl" />

          <div className="relative z-10 max-w-lg">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
              <ClockIcon className="h-3.5 w-3.5" />
              {data.subtitle}
            </span>

            <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {data.title}
            </h2>
            <p className="text-base text-white/70">{data?.product?.title}</p>

            <div className="my-8">
              <CountdownTimer variant="dark" />
            </div>

            <Link
              href="/shop-with-sidebar"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal to-blue px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal/25 transition hover:shadow-teal/40"
            >
              Shop the Deal
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <BackgroundImages data={data} />
        </div>
      </div>
    </section>
  );
};

const BackgroundImages = ({ data }: CountdownBannerProps) => (
  <>
    <Image
      src="/images/countdown/countdown-bg.png"
      alt=""
      aria-hidden
      className="absolute bottom-0 right-0 -z-0 hidden opacity-40 sm:block"
      width={737}
      height={482}
    />
    {data.countdownImage && (
      <Image
        src={data.countdownImage}
        alt={data.product?.title || "Featured product"}
        className="absolute bottom-4 right-4 -z-0 hidden max-h-[280px] w-auto object-contain drop-shadow-2xl lg:block xl:right-16 xl:bottom-8"
        width={316}
        height={370}
      />
    )}
  </>
);

export default CountdownBanner;
