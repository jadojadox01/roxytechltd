import ProductItem from "@/components/Common/ProductItem";
import NewArrivalTitle from "./NewArrivalTitle";
import { getNewArrivalsProduct } from "@/get-api-data/product";
import type { Product } from "@/types/product";

const NewArrival = async () => {
  const newProducts = await getNewArrivalsProduct();
  return (
    <section className="py-2">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <NewArrivalTitle />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {newProducts.map((item: Product, key: number) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
