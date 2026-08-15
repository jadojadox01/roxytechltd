import { createPageMetadata } from "@/lib/metadata";
import { getCatalogPage } from "@/lib/catalog";
import ShopWithoutSidebarClient from "./ShopWithoutSidebarClient";
import type { Product } from "@/types/product";

export async function generateMetadata() {
  return createPageMetadata("Shop", "Browse all our products.");
}

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ sort?: string; q?: string }>;
};

export default async function ShopWithoutSidebarPage({ searchParams }: Props) {
  const { sort = "newest", q = "" } = await searchParams;
  const apiSort =
    sort === "popular" ? "popular" : sort === "oldest" ? "oldest" : "latest";

  const catalog = await getCatalogPage({
    page: 1,
    limit: 15,
    sort: apiSort,
    q: q || undefined,
  });

  return (
    <ShopWithoutSidebarClient
      initialProducts={JSON.parse(JSON.stringify(catalog.products)) as Product[]}
      initialHasMore={catalog.hasMore}
      initialTotal={catalog.total}
      initialSort={sort}
      initialQuery={q}
    />
  );
}
