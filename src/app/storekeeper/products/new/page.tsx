import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import ProductForm from "@/components/Admin/ProductForm";

export default async function StoreKeeperNewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "STORE_KEEPER" && session.user.role !== "ADMIN")) {
    return <div className="p-10 text-slate-700">Access denied</div>;
  }

  const categories = await prismaClientInstance.category.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <StoreKeeperLayout
      title="Add Product"
      description="Create a new product listing for the catalog."
    >
      <ProductForm categories={categories} returnPath="/storekeeper/products" />
    </StoreKeeperLayout>
  );
}
