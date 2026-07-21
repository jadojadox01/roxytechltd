import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prismaClientInstance } from "@/lib/prismaDB";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import ProductEditForm from "@/components/Admin/ProductEditForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return <div className="p-10">Access denied</div>;
  }

  const { id } = await params;
  const [rawProduct, categories] = await Promise.all([
    prismaClientInstance.product.findUnique({ where: { id } }),
    prismaClientInstance.category.findMany({ orderBy: { title: "asc" } }),
  ]);

  if (!rawProduct) {
    return <div className="p-10">Product not found</div>;
  }

  // Serialize Decimal fields to plain strings before passing to the Client Component
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
    <main className="min-h-[80vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <div className="hidden lg:block"><AdminSidebar /></div>
          <div className="lg:hidden"><AdminSidebar /></div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>
          <p className="mt-2 text-sm text-slate-600">Update the product details below.</p>
          <div className="mt-6">
            <ProductEditForm product={product} categories={categories} />
          </div>
        </section>
      </div>
    </main>
  );
}
