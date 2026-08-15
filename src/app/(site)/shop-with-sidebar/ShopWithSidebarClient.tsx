"use client";

import { useMemo, useState } from "react";
import InfiniteProductGrid from "@/components/Common/InfiniteProductGrid";
import type { Product } from "@/types/product";

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  productCount: number;
};

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialTotal: number;
  categories: CategoryItem[];
};

const PRICE_RANGES = [
  { label: "Under 50,000 RWF", min: 0, max: 50000 },
  { label: "50,000 - 100,000 RWF", min: 50000, max: 100000 },
  { label: "100,000 - 200,000 RWF", min: 100000, max: 200000 },
  { label: "200,000 - 500,000 RWF", min: 200000, max: 500000 },
  { label: "Over 500,000 RWF", min: 500000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

export default function ShopWithSidebarClient({
  initialProducts,
  initialHasMore,
  initialTotal,
  categories,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [total, setTotal] = useState(initialTotal);

  const priceRange = PRICE_RANGES.find((r) => r.label === selectedPriceRange);

  const query = useMemo(
    () => ({
      category: selectedCategory,
      sort: sortBy,
      minPrice: priceRange?.min ?? null,
      maxPrice: priceRange?.max ?? null,
    }),
    [selectedCategory, sortBy, priceRange?.min, priceRange?.max]
  );

  const isDefaultQuery =
    !selectedCategory && !selectedPriceRange && sortBy === "latest";

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    setSortBy("latest");
  };

  const hasActiveFilters = Boolean(selectedCategory || selectedPriceRange);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <button
        className="flex items-center gap-2 rounded-lg border border-[#ffcfad] bg-white px-4 py-2.5 text-sm font-semibold text-[#1c2ea3] shadow-sm lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" />
        </svg>
        {sidebarOpen ? "Hide Filters" : "Show Filters"}
      </button>

      <aside className={`w-full shrink-0 lg:w-72 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <div className="sticky top-24 space-y-6 rounded-2xl border border-[#e8ecff] bg-white p-5 shadow-sm">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Categories
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-[#fff2e8] font-semibold text-[#ff7a1a]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-[#fff2e8] font-semibold text-[#ff7a1a]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.title}
                    <span className="ml-2 text-xs text-slate-400">
                      ({cat.productCount ?? 0})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100" />

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Price Range
            </h3>
            <ul className="space-y-1.5">
              {PRICE_RANGES.map((range) => (
                <li key={range.label}>
                  <button
                    onClick={() => setSelectedPriceRange(range.label)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedPriceRange === range.label
                        ? "bg-[#eef2ff] font-semibold text-[#1c2ea3]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {range.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Clear Filters
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8ecff] bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{total}</span> products
            <span className="ml-1 text-slate-400">· scroll to load more</span>
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-slate-600">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#1c2ea3] focus:ring-1 focus:ring-[#1c2ea3]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <InfiniteProductGrid
          key={JSON.stringify(query)}
          initialProducts={isDefaultQuery ? initialProducts : []}
          initialHasMore={isDefaultQuery ? initialHasMore : true}
          initialTotal={isDefaultQuery ? initialTotal : 0}
          pageSize={12}
          query={query}
          wrapItem
          gridClassName="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          onTotalChange={setTotal}
          emptyTitle="No products found"
          emptyDescription="Try adjusting your filters to find what you're looking for."
        />
      </div>
    </div>
  );
}
