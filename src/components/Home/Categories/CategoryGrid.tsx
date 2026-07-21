import { getCategories } from "@/get-api-data/category";
import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

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

  const items = categories.slice(0, 12);

  return (
    <section className="overflow-hidden pt-15">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold xl:text-heading-4 text-dark">
              Shop by Category
            </h2>
            <p className="mt-1 text-base text-dark-3">
              Browse our most popular collections.
            </p>
          </div>
          <Link
            href="/shop-with-sidebar"
            className="hidden shrink-0 text-sm font-medium text-teal transition hover:text-teal-dark sm:inline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-gray-3 bg-white p-4 text-center transition hover:-translate-y-1 hover:border-teal hover:shadow-1"
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-1">
                <Image
                  src={resolveImage(category.image)}
                  alt={category.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover"
                />
              </div>
              <h3 className="line-clamp-1 text-sm font-medium text-dark transition group-hover:text-teal">
                {category.title}
              </h3>
              <span className="mt-0.5 text-xs text-dark-4">
                {category.productCount || 0} items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
