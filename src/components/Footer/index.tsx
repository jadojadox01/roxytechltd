import Link from "next/link";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import { getCategories } from "@/get-api-data/category";
import { getSiteName } from "@/get-api-data/seo-setting";

const Footer = async () => {
  const [siteSettings, headerSettings, categories, siteName] = await Promise.all([
    getSiteSettings(),
    getHeaderSettings(),
    getCategories(),
    getSiteName(),
  ]);

  const year = new Date().getFullYear();
  const productLinks = (categories ?? []).slice(0, 5);
  const brandText =
    siteSettings?.about?.trim() ||
    "Rwanda's trusted shop for stationery, school supplies, and electronics. Fast delivery, MTN MoMo accepted, quality guaranteed.";

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

  const paymentBadges = ["MTN MoMo", "Airtel", "Visa", "Mastercard"];

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
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
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
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-white/55">
            © {year} {siteName} · All rights reserved · Kigali, Rwanda
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-md bg-white/12 px-2.5 py-1 text-[11.5px] font-semibold text-white"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
