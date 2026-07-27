import { getCategories } from "@/get-api-data/category";
import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "../shared/SectionHeader";
import { ArrowRightIcon } from "@/assets/icons";

const resolveImage = (image: string | null) => {
  if (image && image.trim()) {
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `/${image}`;
  }
  return "/images/products/product-placeholder.svg";
};

const CategoryGrid = async () => {
  const categories: Category[] = await getCategories();

  if (!categories || categories.length === 0) return null;

  const items = categories.slice(0, 8);

  return (
    <section className="overflow-hidden">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by Category"
          description="Explore our most popular collections and find exactly what you need."
          href="/shop-with-sidebar"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-3 bg-white transition duration-300 hover:-translate-y-1 hover:border-teal/40 hover:shadow-lg hover:shadow-teal/10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-dark/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="flex flex-col items-center p-5 text-center sm:p-6">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gray-1 ring-1 ring-gray-3/50 transition duration-300 group-hover:ring-teal/30 sm:h-24 sm:w-24">
                  <Image
                    src={resolveImage(category.image)}
                    alt={category.title}
                    width={80}
                    height={80}
                    className="h-16 w-16 object-cover transition duration-500 group-hover:scale-110 sm:h-20 sm:w-20"
                  />
                </div>
                <h3 className="line-clamp-1 text-sm font-semibold text-dark transition group-hover:text-teal sm:text-base">
                  {category.title}
                </h3>
                <span className="mt-1 text-xs text-dark-4">
                  {category.productCount || 0} products
                </span>
              </div>
              <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-teal text-white opacity-0 transition duration-300 group-hover:opacity-100">
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
