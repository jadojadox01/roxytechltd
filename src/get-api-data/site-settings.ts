import { prisma } from "@/lib/prismaDB";

export const getSiteSettings = async () => {
  try {
    const settings = await prisma.siteSetting.findFirst();
    return settings || null;
  } catch {
    return null;
  }
};