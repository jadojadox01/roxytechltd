import { getPrismaModel } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

const seoSettingModel = getPrismaModel("seoSetting");
const headerSettingModel = getPrismaModel("headerSetting");

// get all seo settings
export const getSeoSettings = unstable_cache(
  async () => {
    return await seoSettingModel.findFirst();
  },
  ['seo-setting'], { tags: ['seo-setting'] }
);

export const getSiteName = unstable_cache(
  async () => {
    const siteName = await seoSettingModel.findFirst({
      select: {
        siteName: true,
      },
    });
    return siteName ? siteName.siteName : process.env.SITE_NAME ? process.env.SITE_NAME : "ROXY TECH";
  },
  ['site-name'], { tags: ['site-name'] }
);

// get logo 
export const getLogo = unstable_cache(
  async () => {
    const headerLogo = await headerSettingModel.findFirst({
      select: {
        headerLogo: true,
      },
    });
    const logo = headerLogo ? headerLogo.headerLogo : "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746335068/header/tsvfm6pvfwpbpyqdtxwn.svg";
    return logo;
  },
  ['header-logo'], { tags: ['header-logo'] }
);

// get email logo
export const getEmailLogo = unstable_cache(
  async () => {
    const emailLogo = await headerSettingModel.findFirst({
      select: {
        emailLogo: true,
      },
    });
    const logo = emailLogo ? emailLogo.emailLogo : "https://res.cloudinary.com/dc6svbdh9/image/upload/v1746693785/logo_ouegg7.png";
    return logo;
  },
  ['email-logo'], { tags: ['email-logo'] }
);

