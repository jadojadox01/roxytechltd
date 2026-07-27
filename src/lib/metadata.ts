import type { Metadata } from "next";
import { getSiteName } from "@/get-api-data/seo-setting";

export async function createPageMetadata(
  pageTitle: string,
  description?: string
): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: `${pageTitle} | ${siteName}`,
    ...(description ? { description } : {}),
  };
}
