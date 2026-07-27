import Link from "next/link";
import BestSellerSectionTitle from "./BestSellerSectionTitle";
import SingleItem from "./SingleItem";
import { getBestSellingProducts } from "@/get-api-data/product";
import type { Product } from "@/types/product";

const BestSeller = async () => {
  const bestSellProducts = await getBestSellingProducts();

  return (
    <section className="py-2">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <BestSellerSectionTitle />

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {bestSellProducts.length > 0 &&
            bestSellProducts.map((item: Product, key: number) => (
              <SingleItem item={item} key={key} />
            ))}
        </div>

        <div className="mt-10 text-center sm:mt-12">
          <Link
            href="/shop-without-sidebar"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-blue px-8 py-3 text-sm font-semibold text-blue transition hover:bg-blue hover:text-white"
          >
            View All Products
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
