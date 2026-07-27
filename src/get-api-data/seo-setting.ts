import { prisma } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

export const getSeoSettings = unstable_cache(
  async () => {
    try {
      return await prisma.seoSetting.findFirst();
    } catch (error) {
      console.error("[getSeoSettings]", error);
      return null;
    }
  },
  ["seo-setting"],
  { tags: ["seo-setting"] }
);

export const getSiteName = unstable_cache(
  async () => {
    try {
      const [header, seo] = await Promise.all([
        prisma.headerSetting.findFirst({ select: { siteName: true } }),
        prisma.seoSetting.findFirst({ select: { siteName: true } }),
      ]);
      return (
        header?.siteName?.trim() ||
        seo?.siteName?.trim() ||
        process.env.SITE_NAME?.trim() ||
        "Shop"
      );
    } catch (error) {
      console.error("[getSiteName]", error);
      return process.env.SITE_NAME?.trim() || "Shop";
    }
  },
  ["site-name"],
  { tags: ["site-name", "header-setting", "seo-setting"] }
);

export const getLogo = unstable_cache(
  async () => {
    try {
      const headerLogo = await prisma.headerSetting.findFirst({
        select: { headerLogo: true },
      });
      return headerLogo?.headerLogo || null;
    } catch (error) {
      console.error("[getLogo]", error);
      return null;
    }
  },
  ["header-logo"],
  { tags: ["header-logo"] }
);

export const getEmailLogo = unstable_cache(
  async () => {
    try {
      const emailLogo = await prisma.headerSetting.findFirst({
        select: { emailLogo: true },
      });
      return emailLogo?.emailLogo || null;
    } catch (error) {
      console.error("[getEmailLogo]", error);
      return null;
    }
  },
  ["email-logo"],
  { tags: ["email-logo"] }
);
