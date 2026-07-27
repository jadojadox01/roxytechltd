import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

export const getSiteSettings = unstable_cache(
  async () => {
    try {
      return await prisma.siteSetting.findFirst();
    } catch (error) {
      console.error("[getSiteSettings]", error);
      return null;
    }
  },
  ["site-settings"],
  { tags: ["site-settings"] }
);