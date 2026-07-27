import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/utils/formatePrice";
import { IHeroBanner } from "@/types/hero";
import { ArrowRightIcon } from "@/assets/icons";

export default function HeroBannerItem({ bannerItem }: { bannerItem: IHeroBanner }) {
  const productSlug = bannerItem?.product?.slug || "shop-without-sidebar";
  const price = bannerItem?.product?.discountedPrice ?? bannerItem?.product?.price;

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group relative flex flex-1 items-center justify-between gap-4 overflow-hidden rounded-2xl border border-gray-3/60 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-lg hover:shadow-teal/10 sm:p-6"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative z-10 flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal">
          {bannerItem.subtitle || "Limited Offer"}
        </p>
        <h2 className="mb-1 max-w-[160px] text-lg font-bold leading-snug text-dark transition group-hover:text-teal">
          {bannerItem.bannerName}
        </h2>
        {price != null && Number(price) > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg font-bold text-dark">{formatPrice(Number(price))}</span>
            {bannerItem?.product?.discountedPrice && (
              <span className="text-sm text-dark-4 line-through">
                {formatPrice(Number(bannerItem.product.price))}
              </span>
            )}
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal">
          {bannerItem.ctaLabel || "Shop now"}
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
      <div className="relative z-10 shrink-0">
        <Image
          src={bannerItem?.bannerImage || "/images/products/product-placeholder.svg"}
          alt={bannerItem.bannerName || "Product"}
          width={120}
          height={140}
          className="object-contain transition duration-500 group-hover:scale-110"
        />
      </div>
    </Link>
  );
}
