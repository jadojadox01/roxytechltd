"use client";

import InfiniteProductGrid from "@/components/Common/InfiniteProductGrid";
import type { Product } from "@/types/product";

type Props = {
  initialProducts: Product[];
  initialHasMore: boolean;
  initialTotal: number;
};

export default function HomeFeaturedProducts({
  initialProducts,
  initialHasMore,
  initialTotal,
}: Props) {
  return (
    <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-8 xl:px-0" id="products">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 md:text-3xl">
          Featured <span className="text-[#ff7a1a]">Products</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Keep scrolling to browse the full catalog.
        </p>
      </div>

      <InfiniteProductGrid
        initialProducts={initialProducts}
        initialHasMore={initialHasMore}
        initialTotal={initialTotal}
        pageSize={12}
        query={{ sort: "latest" }}
        emptyTitle="No products yet"
        emptyDescription="Add products in Admin → Products."
      />
    </section>
  );
}
