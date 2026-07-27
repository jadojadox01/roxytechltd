import { prismaClientInstance } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

export const getApprovedReviews = unstable_cache(
  async () => {
    try {
      return await prismaClientInstance.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          product: {
            select: { title: true, slug: true, images: true },
          },
        },
      });
    } catch (error) {
      console.error("[getApprovedReviews]", error);
      return [];
    }
  },
  ["approved-reviews"],
  { tags: ["reviews"] }
);
