import Link from "next/link";

type Tile = {
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  className: string;
  titleClass: string;
  subtitleClass: string;
  ctaClass: string;
};

const tiles: Tile[] = [
  {
    eyebrow: "Deals of the day",
    title: "Everyday low prices",
    subtitle: "Save big across the whole store.",
    href: "/shop-without-sidebar",
    cta: "Shop deals",
    className: "bg-yellow",
    titleClass: "text-dark",
    subtitleClass: "text-dark/70",
    ctaClass: "bg-dark text-white hover:bg-black",
  },
  {
    eyebrow: "Free delivery",
    title: "Fast, free shipping",
    subtitle: "On orders over 100,000 RWF.",
    href: "/shop-without-sidebar",
    cta: "Start shopping",
    className: "bg-blue",
    titleClass: "text-white",
    subtitleClass: "text-white/80",
    ctaClass: "bg-white text-blue hover:bg-yellow hover:text-dark",
  },
  {
    eyebrow: "Just landed",
    title: "New arrivals",
    subtitle: "The latest tech, fresh in stock.",
    href: "/shop-with-sidebar",
    cta: "Explore new",
    className: "bg-blue-dark",
    titleClass: "text-white",
    subtitleClass: "text-white/80",
    ctaClass: "bg-yellow text-dark hover:bg-white",
  },
];

const PromoBand = () => {
  return (
    <section className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div
            key={tile.title}
            className={`flex flex-col justify-between rounded-2xl p-6 ${tile.className}`}
          >
            <div>
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${tile.subtitleClass}`}
              >
                {tile.eyebrow}
              </span>
              <h3 className={`mt-2 text-2xl font-bold leading-tight ${tile.titleClass}`}>
                {tile.title}
              </h3>
              <p className={`mt-1 text-sm ${tile.subtitleClass}`}>{tile.subtitle}</p>
            </div>
            <Link
              href={tile.href}
              className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${tile.ctaClass}`}
            >
              {tile.cta}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromoBand;
