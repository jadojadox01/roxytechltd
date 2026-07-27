import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteName } from "@/get-api-data/seo-setting";
import StoreKeeperSidebar from "@/components/StoreKeeper/StoreKeeperSidebar";

interface StoreKeeperLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default async function StoreKeeperLayout({
  title,
  description,
  children,
}: StoreKeeperLayoutProps) {
  const [siteName, session] = await Promise.all([getSiteName(), getServerSession(authOptions)]);
  const userLabel = session?.user?.name || session?.user?.email || "Operator";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-white">
      <header className="sticky top-0 z-30 border-b border-amber-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-amber-900">{siteName}</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">
              Store Operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden truncate text-sm text-slate-600 sm:inline">{userLabel}</span>
            <a
              href="/"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Storefront
            </a>
          </div>
        </div>
      </header>

      <main className="pb-12 pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="hidden shrink-0 lg:block lg:w-64">
              <StoreKeeperSidebar siteName={siteName} />
            </div>

            <details className="lg:hidden">
              <summary className="cursor-pointer rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-amber-900 shadow-sm">
                Operations menu
              </summary>
              <div className="mt-3">
                <StoreKeeperSidebar siteName={siteName} />
              </div>
            </details>

            <section className="min-w-0 flex-1 space-y-6">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-6 shadow-lg ring-1 ring-amber-600/20 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-100">
                      {siteName}
                    </p>
                    <span className="mt-1 inline-flex rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/90">
                      Warehouse & Orders
                    </span>
                    <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
                    {description && (
                      <p className="mt-2 max-w-2xl text-sm text-amber-50 sm:text-base">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-sm ring-1 ring-amber-100 sm:p-6">
                {children}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
