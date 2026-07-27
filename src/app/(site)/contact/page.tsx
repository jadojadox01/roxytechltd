import { getSiteSettings } from "@/get-api-data/site-settings";
import { createPageMetadata } from "@/lib/metadata";
import ContactForm from "./ContactForm";

export async function generateMetadata() {
  return createPageMetadata("Contact Us", "Get in touch with us.");
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const phone = settings?.contactPhone || null;
  const email = settings?.contactEmail || null;
  const address = settings?.contactAddress || null;
  const facebookUrl = settings?.facebookUrl || null;
  const instagramUrl = settings?.instagramUrl || null;
  const twitterUrl = settings?.twitterUrl || null;
  const linkedinUrl = settings?.linkedinUrl || null;

  const hasContactInfo = Boolean(phone || email || address);
  const hasSocial = Boolean(facebookUrl || instagramUrl || twitterUrl || linkedinUrl);

  return (
    <main className="min-h-[80vh] bg-slate-50">
      <section className="bg-gradient-to-br from-[#02AAA4] via-[#028f86] to-[#0071CE] py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">We&apos;re here to help</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Get in Touch</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90">
            Questions about an order, a product, or a partnership? Send us a message and our team will respond as soon as possible.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />

          <div className="space-y-5">
            {hasContactInfo ? (
              <>
                {phone && (
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#02AAA4]/10">
                      <svg className="h-5 w-5 text-[#02AAA4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Phone</p>
                      <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="mt-1 block text-sm font-semibold text-slate-800 hover:text-[#02AAA4]">
                        {phone}
                      </a>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0071CE]/10">
                      <svg className="h-5 w-5 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
                      <a href={`mailto:${email}`} className="mt-1 block break-all text-sm font-semibold text-slate-800 hover:text-[#0071CE]">
                        {email}
                      </a>
                    </div>
                  </div>
                )}

                {address && (
                  <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100">
                      <svg className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Address</p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-slate-800">{address}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                Contact details can be configured in{" "}
                <a href="/admin/settings" className="font-medium text-[#0071CE] hover:underline">
                  Admin → Settings
                </a>
              </div>
            )}

            {hasSocial && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Follow us</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { url: facebookUrl, label: "Facebook" },
                    { url: instagramUrl, label: "Instagram" },
                    { url: twitterUrl, label: "Twitter" },
                    { url: linkedinUrl, label: "LinkedIn" },
                  ]
                    .filter((item) => item.url)
                    .map((item) => (
                      <a
                        key={item.label}
                        href={item.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#02AAA4] hover:text-[#02AAA4]"
                      >
                        {item.label}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
