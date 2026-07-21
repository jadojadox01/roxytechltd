import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/assets/icons/social";
import Link from "next/link";
import AccountLinks from "./AccountLinks";
import FooterBottom from "./FooterBottom";
import QuickLinks from "./QuickLinks";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getHeaderSettings } from "@/get-api-data/header-setting";
import { getCategories } from "@/get-api-data/category";

const Footer = async () => {
  const [siteSettings, headerSettings, categories] = await Promise.all([
    getSiteSettings(),
    getHeaderSettings(),
    getCategories(),
  ]);

  const siteName = (headerSettings as any)?.siteName || "ROXY TECH";
  const address = siteSettings?.contactAddress || null;
  const phone = siteSettings?.contactPhone || null;
  const email = siteSettings?.contactEmail || null;
  const facebookUrl = siteSettings?.facebookUrl || null;
  const twitterUrl = siteSettings?.twitterUrl || null;
  const instagramUrl = siteSettings?.instagramUrl || null;
  const linkedinUrl = siteSettings?.linkedinUrl || null;

  const hasSocial = facebookUrl || twitterUrl || instagramUrl || linkedinUrl;
  const footerCategories = (categories ?? []).slice(0, 6);

  return (
    <footer className="border-t border-gray-3 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 xl:py-20">

          {/* Brand + contact */}
          <div className="sm:col-span-2 lg:col-span-2 lg:max-w-[300px]">
            <Link href="/" className="inline-block mb-5">
              {headerSettings?.headerLogo ? (
                <img
                  src={headerSettings.headerLogo}
                  alt={siteName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-dark">{siteName}</span>
              )}
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-dark-4">
              Your one-stop shop for great products at great prices.
            </p>

            <ul className="flex flex-col gap-3 text-sm text-dark-3">
              {address && (
                <li className="flex items-start gap-3">
                  <MapIcon className="fill-teal mt-0.5 shrink-0" width={18} height={18} />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li>
                  <Link
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-3 hover:text-teal transition"
                  >
                    <CallIcon className="fill-teal shrink-0" width={18} height={18} />
                    {phone}
                  </Link>
                </li>
              )}
              {email && (
                <li>
                  <Link
                    href={`mailto:${email}`}
                    className="flex items-center gap-3 hover:text-teal transition break-all"
                  >
                    <EmailIcon className="fill-teal shrink-0" width={18} height={18} />
                    {email}
                  </Link>
                </li>
              )}
            </ul>

            {hasSocial && (
              <div className="mt-6 flex items-center gap-3">
                {facebookUrl && (
                  <Link href={facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-3 text-dark-4 hover:border-teal hover:text-teal transition">
                    <span className="sr-only">Facebook</span>
                    <FacebookIcon />
                  </Link>
                )}
                {twitterUrl && (
                  <Link href={twitterUrl} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-3 text-dark-4 hover:border-teal hover:text-teal transition">
                    <span className="sr-only">Twitter</span>
                    <TwitterIcon />
                  </Link>
                )}
                {instagramUrl && (
                  <Link href={instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-3 text-dark-4 hover:border-teal hover:text-teal transition">
                    <span className="sr-only">Instagram</span>
                    <InstagramIcon />
                  </Link>
                )}
                {linkedinUrl && (
                  <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-3 text-dark-4 hover:border-teal hover:text-teal transition">
                    <span className="sr-only">LinkedIn</span>
                    <LinkedInIcon />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="w-full sm:w-auto">
            <h2 className="mb-7.5 text-xl font-semibold text-dark">Categories</h2>
            {footerCategories.length > 0 ? (
              <ul className="flex flex-col gap-3.5">
                {footerCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      className="text-base text-dark-3 duration-200 ease-out hover:text-teal"
                      href={`/categories/${category.slug}`}
                    >
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-col gap-3.5">
                <li>
                  <Link
                    className="text-base text-dark-3 duration-200 ease-out hover:text-teal"
                    href="/shop-with-sidebar"
                  >
                    All Products
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Account links */}
          <AccountLinks />

          {/* Quick links */}
          <QuickLinks />

        </div>

        {/* Shop CTA strip */}
        <div className="mb-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-dark px-6 py-6 sm:flex-row sm:items-center xl:mb-20">
          <div>
            <h2 className="text-lg font-semibold text-white">Ready to start shopping?</h2>
            <p className="mt-1 text-sm text-white/70">
              Browse our latest products, deals, and best sellers.
            </p>
          </div>
          <Link
            href="/shop-without-sidebar"
            className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Shop Now
          </Link>
        </div>
      </div>

      <FooterBottom />
    </footer>
  );
};

export default Footer;
