import { getCategories } from "@/get-api-data/category";
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
  const categories = await getCategories();

  if (!categories || categories.length === 0) return null;

  const items = categories.slice(0, 8);

  return (
    <section className="overflow-hidden pt-10" id="categories">
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
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#1c2ea3]/40 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c2ea3]/70 via-[#1c2ea3]/15 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col items-center p-5 text-center sm:p-6">
                <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200 transition duration-300 group-hover:ring-white/40 sm:h-24 sm:w-24">
                  <Image
                    src={resolveImage(category.image)}
                    alt={category.title}
                    width={80}
                    height={80}
                    className="h-16 w-16 object-cover transition duration-500 group-hover:scale-110 sm:h-20 sm:w-20"
                  />
                </div>
                <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 transition group-hover:text-white sm:text-base">
                  {category.title}
                </h3>
                <span className="mt-1 text-xs text-slate-500 transition group-hover:text-white/80">
                  {category.productCount || 0} products
                </span>
              </div>
              <div className="absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#ff7a1a] text-white opacity-0 transition duration-300 group-hover:opacity-100">
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
