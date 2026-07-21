import type { Metadata } from "next";
import { getAllProducts } from "@/get-api-data/product";
import ProductItem from "@/components/Common/ProductItem";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shop | ROXY TECH",
  description: "Browse all our products.",
};

type SortOption = "newest" | "oldest" | "popular";

type Props = {
  searchParams: Promise<{ sort?: string; q?: string }>;
};

export default async function ShopWithoutSidebarPage({ searchParams }: Props) {
  const { sort = "newest", q = "" } = await searchParams;

  const orderBy =
    sort === "popular"
      ? { reviews: { _count: "desc" as const } }
      : sort === "oldest"
      ? { updatedAt: "asc" as const }
      : { updatedAt: "desc" as const };

  const allProducts = await getAllProducts(orderBy);

  // Client-side search filter (runs server-side here since we have all products)
  const products = q
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          (p.shortDescription ?? "").toLowerCase().includes(q.toLowerCase())
      )
    : allProducts;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
    <main className="min-h-[80vh] bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-0">

        {/* Header row */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">All Products</h1>
            <p className="mt-1 text-sm text-slate-500">
              {products.length} product{products.length !== 1 ? "s" : ""} found
              {q ? ` for "${q}"` : ""}
            </p>
          </div>

          {/* Sort + Search */}
          <form method="get" className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search products..."
                className="h-10 w-56 rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20"
              />
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              name="sort"
              defaultValue={sort}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#0071CE]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              type="submit"
              className="h-10 rounded-lg bg-[#0071CE] px-4 text-sm font-semibold text-white hover:bg-[#005fb0] transition"
            >
              Apply
            </button>

            {(q || sort !== "newest") && (
              <Link
                href="/shop-without-sidebar"
                className="h-10 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} item={product as any} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {q ? `Try a different search term` : "No products have been added yet"}
            </p>
            {q && (
              <Link
                href="/shop-without-sidebar"
                className="mt-4 text-sm font-medium text-[#0071CE] hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
