import Link from "next/link";
import BestSellerSectionTitle from "./BestSellerSectionTitle";
import SingleItem from "./SingleItem";
import { getBestSellingProducts } from "@/get-api-data/product";
import type { Product } from "@/types/product";

const BestSeller = async () => {
  const bestSellProducts = await getBestSellingProducts();

  return (
    <section className="overflow-hidden">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <BestSellerSectionTitle />

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {bestSellProducts.length > 0 &&
            bestSellProducts.map((item: Product, key: number) => (
              <SingleItem item={item} key={key} />
            ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-semibold text-custom-sm py-3 px-7 sm:px-12.5 rounded-full border-blue border text-blue ease-out duration-200 hover:bg-blue hover:text-white"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
