import Link from "next/link";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import { getCategories } from "@/get-api-data/category";
import { getSiteName } from "@/get-api-data/seo-setting";
import FooterSupportLinks from "./FooterSupportLinks";

function excerptAbout(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return { preview: clean, truncated: false };
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return {
    preview: `${cut.slice(0, lastSpace > 80 ? lastSpace : max).trim()}...`,
    truncated: true,
  };
}

const Footer = async () => {
  const [siteSettings, headerSettings, categories, siteName] = await Promise.all([
    getSiteSettings(),
    getHeaderSettings(),
    getCategories(),
    getSiteName(),
  ]);

  const year = new Date().getFullYear();
  const productLinks = (categories ?? []).slice(0, 5);
  const fullAbout =
    siteSettings?.about?.trim() ||
    "Rwanda's trusted shop for stationery, school supplies, and electronics. Fast delivery, MTN MoMo accepted, quality guaranteed.";
  const { preview: brandText, truncated: aboutTruncated } = excerptAbout(fullAbout);

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/contact" },
    { label: "Blog", href: "/blogs/blog-grid" },
    { label: "Press", href: "/contact" },
    { label: "Contact", href: "/contact" },
  ];

  const supportLinks = [
    { label: "Help Centre", href: "/contact" },
    { label: "Track Order", href: "/track-order" },
    { label: "Returns", href: "/contact" },
    { label: "Shipping Info", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  const paymentMethods = [
    { src: "/images/payment/airtel-money.png", alt: "Airtel Money" },
    { src: "/images/payment/bank-card.png", alt: "Bank cards" },
    { src: "/images/payment/mobile-money.png", alt: "MTN Mobile Money" },
  ];

  return (
    <footer className="bg-[#0f1e4a] px-4 pb-6 pt-12 text-white/70 sm:px-8 xl:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <img
                src={headerSettings?.headerLogo || "/images/logo/logo.svg"}
                alt={siteName}
                className="h-20 w-auto max-w-[260px] object-contain sm:h-24 sm:max-w-[320px]"
              />
            </Link>
            <p className="mt-3 max-w-xs text-[13.5px] leading-7 text-white/65">
              {brandText}
            </p>
            {aboutTruncated ? (
              <Link
                href="/about"
                className="mt-2 inline-flex text-[13px] font-semibold text-[#ff7a20] transition hover:text-white"
              >
                Read more...
              </Link>
            ) : null}
          </div>

          {/* Products — live categories */}
          <div>
            <h4 className="mb-3.5 text-[13.5px] font-bold tracking-wide text-white">
              Products
            </h4>
            <ul className="space-y-2">
              {productLinks.length > 0 ? (
                productLinks.map((category: { id: string; title: string; slug: string }) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-[13px] text-white/60 transition hover:text-[#ff7a20]"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/shop-with-sidebar"
                    className="text-[13px] text-white/60 transition hover:text-[#ff7a20]"
                  >
                    All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3.5 text-[13.5px] font-bold tracking-wide text-white">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-white/60 transition hover:text-[#ff7a20]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-3.5 text-[13.5px] font-bold tracking-wide text-white">
              Support
            </h4>
            <FooterSupportLinks links={supportLinks} />
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-white/55">
            © {year} {siteName} · All rights reserved · Kigali, Rwanda
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {paymentMethods.map((method) => (
              <span
                key={method.alt}
                className="inline-flex h-11 items-center justify-center overflow-hidden rounded-md bg-white p-1 shadow-sm"
              >
                <img
                  src={method.src}
                  alt={method.alt}
                  className="h-9 w-auto max-w-[72px] object-contain"
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
