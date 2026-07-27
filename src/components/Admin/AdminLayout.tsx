import type { ReactNode } from "react";
import { getSiteName } from "@/get-api-data/seo-setting";
import AdminSidebar from "@/components/Admin/AdminSidebar";

interface AdminLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default async function AdminLayout({
  title,
  description,
  children,
}: AdminLayoutProps) {
  const siteName = await getSiteName();

  return (
    <main className="min-h-screen bg-slate-100 pt-28 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden shrink-0 lg:block lg:w-64">
            <AdminSidebar siteName={siteName} />
          </div>

          <details className="lg:hidden">
            <summary className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              Admin menu
            </summary>
            <div className="mt-3">
              <AdminSidebar siteName={siteName} />
            </div>
          </details>

          <section className="min-w-0 flex-1 space-y-6">
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 shadow-lg sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-300">
                    {siteName}
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    Administrator
                  </span>
                  <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                  {description && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                      {description}
                    </p>
                  )}
                </div>
                <LinkHome siteName={siteName} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LinkHome({ siteName }: { siteName: string }) {
  return (
    <a
      href="/"
      className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
    >
      View {siteName} store
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  );
}
