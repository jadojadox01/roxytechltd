import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import StoreKeeperLayout from "@/components/StoreKeeper/StoreKeeperLayout";
import ProductEditForm from "@/components/Admin/ProductEditForm";

export default async function StoreKeeperEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "STORE_KEEPER" && session.user.role !== "ADMIN")) {
    return <div className="p-10 text-slate-700">Access denied</div>;
  }

  const { id } = await params;
  const [rawProduct, categories] = await Promise.all([
    prismaClientInstance.product.findUnique({ where: { id } }),
    prismaClientInstance.category.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!rawProduct) {
    return (
      <StoreKeeperLayout title="Edit Product">
        <p className="text-sm text-slate-600">Product not found.</p>
      </StoreKeeperLayout>
    );
  }

  const product = {
    id: rawProduct.id,
    title: rawProduct.title,
    slug: rawProduct.slug,
    shortDescription: rawProduct.shortDescription,
    description: rawProduct.description,
    price: rawProduct.price.toString(),
    discountedPrice: rawProduct.discountedPrice?.toString() ?? null,
    quantity: rawProduct.quantity,
    categoryId: rawProduct.categoryId,
    isNewArrival: rawProduct.isNewArrival,
    images: rawProduct.images,
  };

  return (
    <StoreKeeperLayout
      title="Edit Product"
      description="Update product details, pricing, stock, and images."
    >
      <ProductEditForm
        product={product}
        categories={categories}
        returnPath="/storekeeper/products"
      />
    </StoreKeeperLayout>
  );
}
