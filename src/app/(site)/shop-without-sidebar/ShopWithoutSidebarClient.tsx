"use client";

import { useMemo, useState } from "react";
import InfiniteProductGrid from "@/components/Common/InfiniteProductGrid";
import type { Product } from "@/types/product";

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialTotal: number;
  initialSort: string;
  initialQuery: string;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", api: "latest" },
  { value: "popular", label: "Most Popular", api: "popular" },
  { value: "oldest", label: "Oldest", api: "oldest" },
];

export default function ShopWithoutSidebarClient({
  initialProducts,
  initialHasMore,
  initialTotal,
  initialSort,
  initialQuery,
}: Props) {
  const [q, setQ] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [appliedQ, setAppliedQ] = useState(initialQuery);
  const [appliedSort, setAppliedSort] = useState(initialSort);
  const [total, setTotal] = useState(initialTotal);

  const apiSort =
    SORT_OPTIONS.find((o) => o.value === appliedSort)?.api || "latest";

  const query = useMemo(
    () => ({
      q: appliedQ || undefined,
      sort: apiSort,
    }),
    [appliedQ, apiSort]
  );

  const matchesInitial = appliedQ === initialQuery && appliedSort === initialSort;

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedQ(q.trim());
    setAppliedSort(sort);
  };

  return (
    <main className="min-h-[80vh] bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-0">
        <div className="mb-8 overflow-hidden rounded-3xl border border-[#e0e7ff] bg-gradient-to-r from-[#1a255f] to-[#24337f] p-6 text-white shadow-sm sm:p-8">
          <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            Catalog view
          </p>
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">All Products</h1>
          <p className="mt-2 text-sm text-white/85">
            {total} product{total !== 1 ? "s" : ""} found
            {appliedQ ? ` for "${appliedQ}"` : ""} · scroll to load more
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#e8ecff] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Search and sort</h2>
            <p className="mt-1 text-sm text-slate-500">Use filters to quickly find items.</p>
          </div>

          <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-56 rounded-lg border border-[#eadbcf] bg-[#fcf7f2] pl-9 pr-4 text-sm outline-none focus:border-[#ff7a1a] focus:ring-2 focus:ring-[#ff7a1a]/20"
              />
              <svg
                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b78b9]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1c2ea3]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="h-10 rounded-lg bg-[#ff7a1a] px-4 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
            >
              Apply
            </button>

            {(appliedQ || appliedSort !== "newest") && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setSort("newest");
                  setAppliedQ("");
                  setAppliedSort("newest");
                }}
                className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-[#1c2ea3] hover:text-[#1c2ea3]"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <InfiniteProductGrid
          key={JSON.stringify(query)}
          initialProducts={matchesInitial ? initialProducts : []}
          initialHasMore={matchesInitial ? initialHasMore : true}
          initialTotal={matchesInitial ? initialTotal : 0}
          pageSize={15}
          query={query}
          gridClassName="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6"
          onTotalChange={setTotal}
          emptyTitle="No products found"
          emptyDescription={
            appliedQ ? "Try a different search term" : "No products have been added yet"
          }
        />
      </div>
    </main>
  );
}
