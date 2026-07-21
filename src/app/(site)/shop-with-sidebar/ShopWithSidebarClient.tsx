"use client";

import { useState, useMemo } from "react";
import ProductItem from "@/components/Common/ProductItem";
import { Product } from "@/types/product";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/utils/formatePrice";

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  productCount: number;
};

type Props = {
  products: Product[];
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

export default function ShopWithSidebarClient({ products, categories }: Props) {
  const pathname = usePathname();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("latest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => {
        const cat = categories.find((c) => c.slug === selectedCategory);
        return cat;
      });
    }

    // Filter by price range
    if (selectedPriceRange) {
      const range = PRICE_RANGES.find((r) => r.label === selectedPriceRange);
      if (range) {
        result = result.filter((p) => {
          const price = p.discountedPrice || p.price;
          return price >= range.min && price < range.max;
        });
      }
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
        break;
      case "price-desc":
        result.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    return result;
  }, [products, selectedCategory, selectedPriceRange, sortBy, categories]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceRange(null);
    setSortBy("latest");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategory || selectedPriceRange;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Mobile sidebar toggle */}
      <button
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm4 6a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm2 6a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" />
        </svg>
        {sidebarOpen ? "Hide Filters" : "Show Filters"}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-full shrink-0 lg:w-72 ${sidebarOpen ? "block" : "hidden"} lg:block`}
      >
        <div className="sticky top-24 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Categories
            </h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    !selectedCategory
                      ? "bg-[#02AAA4]/10 font-medium text-[#02AAA4]"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => { setSelectedCategory(cat.slug); setCurrentPage(1); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-[#02AAA4]/10 font-medium text-[#02AAA4]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.title}
                    <span className="ml-2 text-xs text-slate-400">({cat.productCount})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100" />

          {/* Price Range */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-900">
              Price Range
            </h3>
            <ul className="space-y-1.5">
              {PRICE_RANGES.map((range) => (
                <li key={range.label}>
                  <button
                    onClick={() => { setSelectedPriceRange(range.label); setCurrentPage(1); }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedPriceRange === range.label
                        ? "bg-[#02AAA4]/10 font-medium text-[#02AAA4]"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {range.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Sort & Info Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">{paginatedProducts.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{filteredProducts.length}</span>{" "}
            products
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-slate-600">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#02AAA4] focus:ring-1 focus:ring-[#02AAA4]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product: any) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ProductItem item={product as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mb-3 flex justify-center">
              <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No products found</h3>
            <p className="mb-4 text-sm text-slate-500">
              Try adjusting your filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="rounded-lg bg-[#02AAA4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#028f86]"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-[#02AAA4] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}