import { prismaClientInstance } from "@/lib/prismaDB";

// get all categories
export const getCategories = async () => {
  return await prismaClientInstance.category.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

// GET CATEGORY BY SLUG
export const getCategoryBySlug = async (slug: string) => {
  return await prismaClientInstance.category.findUnique({
    where: {
      slug,
    },
  });
};

// GET CATEGORY BY ID
export const getCategoryById = async (id: string) => {
  return await prismaClientInstance.category.findUnique({
    where: {
      id,
    },
  });
};