import { createPageMetadata } from "@/lib/metadata";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import ProductList from "@/components/Admin/ProductList";
import Link from "next/link";

export async function generateMetadata() {
  return createPageMetadata("Products");
}

export default async function StoreKeeperProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user.role !== "STORE_KEEPER" && session.user.role !== "ADMIN")) {
    return (
      <main className="min-h-[80vh] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
        </div>
      </main>
    );
  }

  return (
    <StoreKeeperLayout
      title="Product Management"
      description="Create, update, and manage products in the catalog."
    >
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[#02AAA4] px-4 py-2 text-sm font-medium text-white hover:bg-[#028f86]"
        >
          + Add Product
        </Link>
      </div>
      <ProductList />
    </StoreKeeperLayout>
  );
}
