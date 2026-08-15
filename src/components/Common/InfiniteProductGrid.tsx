"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductItem from "@/components/Common/ProductItem";
import type { Product } from "@/types/product";

type CatalogQuery = {
  category?: string | null;
  sort?: string;
  q?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
};

type Props = {
  initialProducts?: Product[];
  initialHasMore?: boolean;
  initialTotal?: number;
  pageSize?: number;
  query?: CatalogQuery;
  gridClassName?: string;
  wrapItem?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onTotalChange?: (total: number) => void;
};

function buildUrl(page: number, limit: number, query?: CatalogQuery) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (query?.category) params.set("category", query.category);
  if (query?.sort) params.set("sort", query.sort);
  if (query?.q) params.set("q", query.q);
  if (query?.minPrice != null && Number.isFinite(query.minPrice)) {
    params.set("minPrice", String(query.minPrice));
  }
  if (query?.maxPrice != null && Number.isFinite(query.maxPrice)) {
    params.set("maxPrice", String(query.maxPrice));
  }
  return `/api/products/catalog?${params.toString()}`;
}

export default function InfiniteProductGrid({
  initialProducts = [],
  initialHasMore = true,
  initialTotal = 0,
  pageSize = 12,
  query,
  gridClassName = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  wrapItem = false,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your filters or check back soon.",
  onTotalChange,
}: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(initialTotal);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const queryKey = JSON.stringify(query || {});

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildUrl(nextPage, pageSize, query));
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load products");
        }
        const nextProducts = (data.products || []) as Product[];
        setProducts((prev) => (replace ? nextProducts : [...prev, ...nextProducts]));
        setHasMore(Boolean(data.hasMore));
        setPage(nextPage);
        setTotal(Number(data.total) || 0);
        onTotalChange?.(Number(data.total) || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [onTotalChange, pageSize, query]
  );

  // Reset and reload when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasMore);
    setTotal(initialTotal);
    // If we have no SSR batch for this query, fetch page 1
    if (initialProducts.length === 0) {
      void loadPage(1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loadingRef.current) {
          void loadPage(page + 1);
        }
      },
      { rootMargin: "280px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadPage, page]);

  if (!loading && products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
        <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <div className={gridClassName}>
        {products.map((product) =>
          wrapItem ? (
            <div
              key={product.id}
              className="rounded-2xl border border-[#e8ecff] bg-white p-4 shadow-sm"
            >
              <ProductItem item={product} />
            </div>
          ) : (
            <ProductItem key={product.id} item={product} />
          )
        )}
      </div>

      <div ref={sentinelRef} className="mt-8 flex min-h-12 flex-col items-center justify-center gap-2">
        {loading ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#1c2ea3]" />
            Loading products...
          </div>
        ) : null}
        {!loading && hasMore ? (
          <p className="text-xs text-slate-400">Scroll to load more</p>
        ) : null}
        {!loading && !hasMore && products.length > 0 ? (
          <p className="text-xs text-slate-400">
            You&apos;ve seen all {total || products.length} products
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
