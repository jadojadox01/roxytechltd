import type { Metadata } from "next";
import { getAllProducts } from "@/get-api-data/product";
import { getCategories } from "@/get-api-data/category";
import ShopWithSidebarClient from "./ShopWithSidebarClient";

export const metadata: Metadata = {
  title: "Shop with Sidebar | ROXY TECH",
};

export const dynamic = "force-dynamic";

export default async function ShopWithSidebarPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Shop with Sidebar</h1>
          <p className="mt-2 text-sm text-slate-600">
            Browse our collection of products
          </p>
        </div>

        <ShopWithSidebarClient
          products={JSON.parse(JSON.stringify(products))}
          categories={JSON.parse(JSON.stringify(categories))}
        />
      </div>
    </main>
  );
}