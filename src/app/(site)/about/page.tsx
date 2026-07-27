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

  const hasContent =
    siteSettings?.about ||
    siteSettings?.mission ||
    siteSettings?.vision ||
    siteSettings?.contactPhone ||
    siteSettings?.contactEmail ||
    siteSettings?.contactAddress;

  return (
    <main className="min-h-[80vh] bg-gray-1 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-gray-3 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue to-teal px-6 py-10 sm:px-10">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">About {siteName}</h1>
            <p className="mt-2 text-white/80">Learn more about our story, mission, and vision.</p>
          </div>

          <div className="space-y-8 px-6 py-10 sm:px-10">
            {!hasContent ? (
              <p className="text-dark-3">
                About content has not been configured yet. Update it from{" "}
                <Link href="/admin/settings" className="font-semibold text-teal hover:underline">
                  Admin Settings
                </Link>
                .
              </p>
            ) : (
              <>
                {siteSettings?.about && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold text-dark">Our Story</h2>
                    <p className="leading-relaxed text-dark-3">{siteSettings.about}</p>
                  </section>
                )}
                {siteSettings?.mission && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold text-dark">Our Mission</h2>
                    <p className="leading-relaxed text-dark-3">{siteSettings.mission}</p>
                  </section>
                )}
                {siteSettings?.vision && (
                  <section>
                    <h2 className="mb-3 text-xl font-semibold text-dark">Our Vision</h2>
                    <p className="leading-relaxed text-dark-3">{siteSettings.vision}</p>
                  </section>
                )}
                {(siteSettings?.contactPhone ||
                  siteSettings?.contactEmail ||
                  siteSettings?.contactAddress) && (
                  <section className="rounded-xl bg-gray-1 p-6">
                    <h2 className="mb-4 text-xl font-semibold text-dark">Contact</h2>
                    <ul className="space-y-3 text-dark-3">
                      {siteSettings.contactAddress && (
                        <li className="flex items-start gap-3">
                          <MapIcon className="mt-0.5 shrink-0 fill-teal" width={18} height={18} />
                          {siteSettings.contactAddress}
                        </li>
                      )}
                      {siteSettings.contactPhone && (
                        <li>
                          <Link
                            href={`tel:${siteSettings.contactPhone.replace(/[^0-9+]/g, "")}`}
                            className="flex items-center gap-3 hover:text-teal"
                          >
                            <CallIcon className="shrink-0 fill-teal" width={18} height={18} />
                            {siteSettings.contactPhone}
                          </Link>
                        </li>
                      )}
                      {siteSettings.contactEmail && (
                        <li>
                          <Link
                            href={`mailto:${siteSettings.contactEmail}`}
                            className="flex items-center gap-3 hover:text-teal"
                          >
                            <EmailIcon className="shrink-0 fill-teal" width={18} height={18} />
                            {siteSettings.contactEmail}
                          </Link>
                        </li>
                      )}
                    </ul>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
