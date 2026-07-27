import { getCategories } from "@/get-api-data/category";
import CategoryCarouselArea from "./CategoryCarouselArea";
import SectionHeader from "../shared/SectionHeader";
import Link from "next/link";
import { ArrowRightIcon } from "@/assets/icons";

const CategoryShowcase = async () => {
  const categories = await getCategories();

  if (!categories.length) {
    return (
      <section>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
          <SectionHeader
            eyebrow="Browse"
            title="Shop by Category"
            description="Explore our collections and find exactly what you need."
            href="/shop-with-sidebar"
          />
          <div className="rounded-2xl border border-dashed border-gray-3 bg-gray-1 py-12 text-center">
            <p className="mb-4 text-dark-3">Categories will appear here once added.</p>
            <Link
              href="/shop-with-sidebar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-dark"
            >
              Browse all products
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 xl:px-0">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by Category"
          description="Swipe through our collections — from tech to home essentials."
          href="/shop-with-sidebar"
        />
        <CategoryCarouselArea categories={categories.slice(0, 12)} />
      </div>
    </section>
  );
};

export default CategoryShowcase;
