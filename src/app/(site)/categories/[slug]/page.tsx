import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaClientInstance } from "@/lib/prismaDB";
import ProductItem from "@/components/Common/ProductItem";
import { formatPrice } from "@/utils/formatePrice";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prismaClientInstance.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const products = await prismaClientInstance.product.findMany({
    where: { categoryId: category.id },
    orderBy: { updatedAt: "desc" },
    include: {
      productVariants: true,
    },
  });

  const mappedProducts = products.map((product: any) => ({
    ...product,
    price: Number(product.price),
    discountedPrice: product.discountedPrice ? Number(product.discountedPrice) : null,
    images: Array.isArray(product.images) ? product.images : [],
    productVariants: Array.isArray(product.productVariants) && product.productVariants.length > 0
      ? product.productVariants.map((variant: any) => ({
          ...variant,
          color: variant.color ?? "",
          size: variant.size ?? "",
          isDefault: Boolean(variant.isDefault),
        }))
      : [],
  }));

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#02AAA4]">Category</p>
              <h1 className="text-3xl font-semibold text-slate-900">{category.title}</h1>
              {category.description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{category.description}</p> : null}
            </div>
            <Link href="/" className="text-sm font-semibold text-[#02AAA4] hover:text-[#028f86]">
              Back to home
            </Link>
          </div>
        </div>

        {mappedProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {mappedProducts.map((product: any) => (
              <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <ProductItem item={product as any} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            No products are available in this category yet.
          </div>
        )}
      </div>
    </main>
  );
}
