import { prismaClientInstance } from "@/lib/prismaDB";
import { activeProductWhere } from "@/lib/schema-capabilities";
import { unstable_cache } from "next/cache";

export type PublicCategory = {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  description: string | null;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
};

export const getCategories = unstable_cache(
  async (): Promise<PublicCategory[]> => {
    try {
      const productFilter = await activeProductWhere();
      const categories = await prismaClientInstance.category.findMany({
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          description: true,
          postCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              products: {
                where: productFilter,
              },
            },
          },
        },
      });

      return categories.map(({ _count, ...category }) => ({
        ...category,
        productCount: _count.products,
      }));
    } catch (error) {
      console.error("[getCategories]", error);
      return [];
    }
  },
  ["categories"],
  { tags: ["categories"] }
);

export const getCategoryBySlug = async (slug: string) => {
  try {
    return await prismaClientInstance.category.findUnique({ where: { slug } });
  } catch (error) {
    console.error("[getCategoryBySlug]", error);
    return null;
  }
};

export const getCategoryById = async (id: string) => {
  try {
    return await prismaClientInstance.category.findUnique({ where: { id } });
  } catch (error) {
    console.error("[getCategoryById]", error);
    return null;
  }
};
