import type { Metadata } from "next";
import { getSiteSettings } from "@/get-api-data/site-settings";

export const metadata: Metadata = {
  title: "About Us | Roxy TECH",
};

export default async function AboutPage() {
  const siteSettings = await getSiteSettings();

  const about = siteSettings?.about || "We are committed to providing the best shopping experience with quality products and excellent customer service.";
  const mission = siteSettings?.mission || "Our mission is to deliver exceptional value to our customers through quality products and seamless service.";
  const vision = siteSettings?.vision || "To become the most trusted and beloved online marketplace in the region.";

  return (
    <main className="min-h-[80vh] bg-slate-50 py-14 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">About Us</h1>

          <div className="mt-8 space-y-6 text-base text-slate-600 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Story</h2>
              <p>{about}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Mission</h2>
              <p>{mission}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Our Vision</h2>
              <p>{vision}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Contact</h2>
              {siteSettings?.contactPhone && (
                <p className="mb-1">📞 {siteSettings.contactPhone}</p>
              )}
              {siteSettings?.contactEmail && (
                <p className="mb-1">✉️ {siteSettings.contactEmail}</p>
              )}
              {siteSettings?.contactAddress && (
                <p>📍 {siteSettings.contactAddress}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}