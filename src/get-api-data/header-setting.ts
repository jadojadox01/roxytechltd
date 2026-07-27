import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

export const getHeaderSettings = unstable_cache(
  async () => {
    try {
      return await prisma.headerSetting.findFirst();
    } catch (error) {
      console.error("[getHeaderSettings]", error);
      return null;
    }
  },
  ["header-setting"],
  { tags: ["header-setting"] }
);
