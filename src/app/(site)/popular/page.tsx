import { getBestSellingProducts } from "@/get-api-data/product";
import ProductItem from "@/components/Common/ProductItem";
import type { Product } from "@/types/product";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return createPageMetadata("Popular");
}

export default async function PopularPage() {
  const products = await getBestSellingProducts();

  return (
    <main className="min-h-[80vh] bg-gray-1 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10">
          <span className="mb-2 inline-flex rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal">
            Trending
          </span>
          <h1 className="text-3xl font-bold text-dark sm:text-4xl">Popular Products</h1>
          <p className="mt-2 max-w-2xl text-dark-3">
            Top-rated and best-selling items from the store, ranked by customer reviews and sales activity.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-3 bg-white py-16 text-center text-dark-3">
            No popular products yet. Add products and reviews in the admin panel.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((item: Product) => (
              <ProductItem key={item.id} item={item} bgClr="white" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
