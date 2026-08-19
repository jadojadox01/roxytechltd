import { createPageMetadata } from "@/lib/metadata";
import { getCategories } from "@/get-api-data/category";
import { getCatalogPage } from "@/lib/catalog";
import ShopWithSidebarClient from "./ShopWithSidebarClient";
import type { Product } from "@/types/product";

export async function generateMetadata() {
  return createPageMetadata("Shop");
}

export const dynamic = "force-dynamic";

export default async function ShopWithSidebarPage() {
  const [catalog, categories] = await Promise.all([
    getCatalogPage({ page: 1, limit: 12, sort: "latest" }),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#e0e7ff] bg-gradient-to-r from-[#1a255f] to-[#24337f] p-6 text-white shadow-sm sm:p-8">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Live catalog
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">Shop Products</h1>
          <p className="mt-2 text-sm text-white/85">
            Browse products using categories and filters.
          </p>
        </div>

        <ShopWithSidebarClient
          initialProducts={JSON.parse(JSON.stringify(catalog.products)) as Product[]}
          initialHasMore={catalog.hasMore}
          initialTotal={catalog.total}
          categories={JSON.parse(JSON.stringify(categories))}
        />
      </div>
    </main>
  );
}
