import type { Metadata } from "next";
import { getSiteSettings } from "@/get-api-data/site-settings";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | ROXY TECH",
  description: "Get in touch with us. We'd love to hear from you.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings?.contactPhone || null;
  const email = settings?.contactEmail || null;
  const address = settings?.contactAddress || null;
  const facebookUrl = settings?.facebookUrl || null;
  const instagramUrl = settings?.instagramUrl || null;
  const twitterUrl = settings?.twitterUrl || null;

  return (
    <main className="min-h-[80vh] bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Page header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Get in Touch</h1>
          <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
            Have a question, feedback or need help with an order? Fill in the form and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Contact Form */}
          <ContactForm />

          {/* Contact Info sidebar */}
          <div className="space-y-5">

            {/* Info cards */}
            {phone && (
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0071CE]/10">
                  <svg className="h-5 w-5 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                  <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="mt-0.5 text-sm font-medium text-slate-800 hover:text-[#0071CE] transition">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0071CE]/10">
                  <svg className="h-5 w-5 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
                  <a href={`mailto:${email}`} className="mt-0.5 text-sm font-medium text-slate-800 hover:text-[#0071CE] transition break-all">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0071CE]/10">
                  <svg className="h-5 w-5 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800 leading-relaxed">{address}</p>
                </div>
              </div>
            )}

            {/* Social links */}
            {(facebookUrl || instagramUrl || twitterUrl) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Follow us</p>
                <div className="flex gap-3">
                  {facebookUrl && (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-[#0071CE] hover:text-[#0071CE] transition">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                      </svg>
                    </a>
                  )}
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-[#0071CE] hover:text-[#0071CE] transition">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </a>
                  )}
                  {twitterUrl && (
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-[#0071CE] hover:text-[#0071CE] transition">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Fallback when no settings configured */}
            {!phone && !email && !address && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                Contact details can be configured in{" "}
                <a href="/admin/settings" className="text-[#0071CE] hover:underline">
                  Admin → Settings
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
