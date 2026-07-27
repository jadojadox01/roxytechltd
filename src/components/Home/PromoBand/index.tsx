import { getHeroBanners } from "@/get-api-data/hero";
import Link from "next/link";
import { TagIcon, TruckFastIcon, SparkleIcon } from "@/assets/icons/home";
import { ArrowRightIcon } from "@/assets/icons";

const ICONS = [TagIcon, TruckFastIcon, SparkleIcon];
const GRADIENTS = [
  {
    gradient: "from-amber-400 to-yellow",
    iconBg: "bg-dark/10 text-dark",
    titleClass: "text-dark",
    subtitleClass: "text-dark/70",
    ctaClass: "bg-dark text-white hover:bg-black",
  },
  {
    gradient: "from-teal to-teal-dark",
    iconBg: "bg-white/20 text-white",
    titleClass: "text-white",
    subtitleClass: "text-white/80",
    ctaClass: "bg-white text-teal hover:bg-yellow hover:text-dark",
  },
  {
    gradient: "from-blue to-blue-dark",
    iconBg: "bg-white/20 text-white",
    titleClass: "text-white",
    subtitleClass: "text-white/80",
    ctaClass: "bg-yellow text-dark hover:bg-white",
  },
];

const PromoBand = async () => {
  let banners: Awaited<ReturnType<typeof getHeroBanners>> = [];
  try {
    banners = await getHeroBanners();
  } catch (error) {
    console.error("[PromoBand]", error);
  }

  const tiles = banners.slice(0, 3);
  if (!tiles.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        {tiles.map((banner, index) => {
          const Icon = ICONS[index % ICONS.length];
          const style = GRADIENTS[index % GRADIENTS.length];
          return (
            <div
              key={banner.id}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 transition group-hover:scale-150" />
              <div className="relative">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${style.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${style.subtitleClass}`}>
                  {banner.subtitle || "Featured"}
                </span>
                <h3 className={`mt-1 text-xl font-bold leading-tight sm:text-2xl ${style.titleClass}`}>
                  {banner.bannerName || banner.product?.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${style.subtitleClass}`}>
                  {banner.product?.title
                    ? `Shop ${banner.product.title} at a special price.`
                    : "Limited-time promotion from our catalog."}
                </p>
              </div>
              <Link
                href={`/products/${banner.product?.slug}`}
                className={`relative mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${style.ctaClass}`}
              >
                View deal
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PromoBand;
