import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/get-api-data/site-settings";
import { getSiteName } from "@/get-api-data/seo-setting";
import { createPageMetadata } from "@/lib/metadata";
import { CallIcon, EmailIcon, MapIcon } from "@/assets/icons";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata("About Us");
}

export default async function AboutPage() {
  const [siteSettings, siteName] = await Promise.all([
    getSiteSettings(),
    getSiteName(),
  ]);

  const about =
    siteSettings?.about?.trim() ||
    `${siteName} is Rwanda's trusted destination for stationery, school supplies, and office essentials — with fast delivery and quality guaranteed.`;
  const mission =
    siteSettings?.mission?.trim() ||
    "To make quality school and office materials accessible to every student, teacher, and business across Rwanda.";
  const vision =
    siteSettings?.vision?.trim() ||
    "To be the leading all-in-one shop for stationery and office supplies in Rwanda.";

  const phone = siteSettings?.contactPhone || null;
  const email = siteSettings?.contactEmail || null;
  const address = siteSettings?.contactAddress || null;

  return (
    <main className="min-h-[80vh] bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1a255f] via-[#2b2f72] to-[#f06a16] pt-36 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#1c2ea3]/30 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#ff7a1a]/35 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-8 xl:px-0">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Our story
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            About <span className="text-[#ffb67a]">{siteName}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
            Learn who we are, what we stand for, and how we serve customers across Rwanda.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-8 xl:px-0">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-3xl border border-[#e8ecff] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              Our <span className="text-[#ff7a1a]">Story</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{about}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop-with-sidebar"
                className="inline-flex rounded-lg bg-[#ff7a1a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e7680d]"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex rounded-lg border border-[#1c2ea3] px-5 py-2.5 text-sm font-bold text-[#1c2ea3] transition hover:bg-[#eef2ff]"
              >
                Contact Us
              </Link>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[#e8ecff] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#ff7a1a]">Mission</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">What drives us</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{mission}</p>
            </div>
            <div className="rounded-3xl border border-[#e8ecff] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1c2ea3]">Vision</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">Where we&apos;re going</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{vision}</p>
            </div>
          </aside>
        </div>

        {(phone || email || address) && (
          <section className="mt-8 rounded-3xl border border-[#e8ecff] bg-gradient-to-r from-[#1a255f] to-[#24337f] p-6 text-white shadow-sm sm:p-8">
            <h2 className="text-2xl font-black">Get in touch</h2>
            <p className="mt-2 text-sm text-white/80">Reach us anytime — we&apos;re happy to help.</p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {address && (
                <li className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ffb67a]">
                    <MapIcon className="fill-[#ffb67a]" width={16} height={16} />
                    Address
                  </div>
                  <p className="text-sm text-white/90">{address}</p>
                </li>
              )}
              {phone && (
                <li className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ffb67a]">
                    <CallIcon className="fill-[#ffb67a]" width={16} height={16} />
                    Phone
                  </div>
                  <Link
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="text-sm text-white/90 transition hover:text-[#ffb67a]"
                  >
                    {phone}
                  </Link>
                </li>
              )}
              {email && (
                <li className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#ffb67a]">
                    <EmailIcon className="fill-[#ffb67a]" width={16} height={16} />
                    Email
                  </div>
                  <Link
                    href={`mailto:${email}`}
                    className="break-all text-sm text-white/90 transition hover:text-[#ffb67a]"
                  >
                    {email}
                  </Link>
                </li>
              )}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
