import { getHeaderSettings } from "@/get-api-data/header-setting";
import { getCategories } from "@/get-api-data/category";
import { getDealProducts } from "@/get-api-data/product";
import PromoTickerBar from "./PromoTickerBar";

export default async function PromoTicker() {
  const [header, categories, deals] = await Promise.all([
    getHeaderSettings(),
    getCategories(),
    getDealProducts(),
  ]);

  const items: string[] = [];

  if (header?.headerText) items.push(header.headerText);

  categories.slice(0, 4).forEach((cat) => {
    items.push(`Shop ${cat.title} — ${cat.productCount} products`);
  });

  deals.slice(0, 3).forEach((product) => {
    items.push(`Deal: ${product.title}`);
  });

  return <PromoTickerBar items={items} />;
}
