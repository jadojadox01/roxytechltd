import { getPrismaModel } from "@/lib/prismaDB";
import { unstable_cache } from "next/cache";

const headerSettingModel = getPrismaModel("headerSetting");

// get all header settings
export const getHeaderSettings = unstable_cache(
  async () => {
    return await headerSettingModel.findFirst();
  },
  ['header-setting'], { tags: ['header-setting'] }
);
