import { unstable_cache } from "next/cache";
import {
  DEFAULT_HERO_SUBTITLE,
  DEFAULT_HERO_TITLE,
  getOrCreateSiteSettings,
} from "@/lib/site-settings-db";

export const getSiteSettings = unstable_cache(
  async () => {
    try {
      return await getOrCreateSiteSettings();
    } catch (error) {
      console.error("[getSiteSettings]", error);
      return {
        id: "",
        about: null,
        mission: null,
        vision: null,
        contactPhone: null,
        contactEmail: null,
        contactAddress: null,
        facebookUrl: null,
        twitterUrl: null,
        instagramUrl: null,
        linkedinUrl: null,
        currency: "RWF",
        momoPhone: null,
        momoAccountName: null,
        momoEnabled: true,
        bankCardsEnabled: false,
        bankCardsMessage: "Coming soon",
        codEnabled: true,
        heroEyebrow: "New collection",
        heroTitle: DEFAULT_HERO_TITLE,
        heroSubtitle: DEFAULT_HERO_SUBTITLE,
      };
    }
  },
  ["site-settings"],
  { tags: ["site-settings"] }
);
