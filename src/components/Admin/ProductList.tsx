"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatPrice } from "@/utils/formatePrice";

type ProductItem = {
  id: string;
  title: string;
  slug: string;
  price: string | number | null;
  quantity?: number | null;
  shortDescription?: string | null;
  description?: string | null;
  images?: string[];
  category?: {
    title?: string | null;
  } | null;
};

export default function ProductList() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const mountedRef = useRef(false);

  const editBase = pathname.startsWith("/storekeeper")
    ? "/storekeeper/products"
    : "/admin/products";

  const loadProducts = useCallback(async () => {
    try {
      if (mountedRef.current) setLoading(true);
      const res = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const payload = await res.json();
      if (!mountedRef.current) return;
      setProducts(Array.isArray(payload) ? payload : []);
    } catch {
      if (!mountedRef.current) return;
      setProducts([]);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadProducts();
    return () => {
      mountedRef.current = false;
    };
  }, [loadProducts]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this product?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((prev) => prev.filter((product) => product.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete product");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
        No products yet. Create your first product to see it here.
      </div>
    );
  }

  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="hidden min-w-full divide-y divide-slate-200 md:table">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Price
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.map((product) => {
                const firstImage =
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : "/images/products/product-placeholder.svg";

                return (
                  <tr key={product.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={firstImage}
                          alt={product.title}
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                          <div className="max-w-xs truncate font-medium text-slate-900">
                            {product.title}
                          </div>
                          <div className="max-w-xs truncate text-xs text-slate-500">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {product.category?.title || "Uncategorized"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-900">
                      {formatPrice(Number(product.price || 0))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          (product.quantity ?? 0) > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.quantity ?? 0}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/products/${encodeURIComponent(product.slug)}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          title="View product"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`${editBase}/${product.id}/edit`)}
                          className="inline-flex items-center justify-center rounded-lg border border-[#1c2ea3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c2ea3] transition hover:bg-[#eef2ff]"
                          title="Edit product"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={busyId === product.id}
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          title="Delete product"
                        >
                          {busyId === product.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="divide-y divide-slate-200 md:hidden">
            {products.map((product) => {
              const firstImage =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : "/images/products/product-placeholder.svg";

              return (
                <div key={product.id} className="bg-white p-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={firstImage}
                      alt={product.title}
                      className="h-16 w-16 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-slate-900">
                        {product.title}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{product.slug}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {product.category?.title || "Uncategorized"}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            (product.quantity ?? 0) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Stock: {product.quantity ?? 0}
                        </span>
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {formatPrice(Number(product.price || 0))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(`/products/${encodeURIComponent(product.slug)}`, "_blank")
                      }
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`${editBase}/${product.id}/edit`)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1c2ea3] bg-white px-3 py-2 text-xs font-semibold text-[#1c2ea3] transition hover:bg-[#eef2ff]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyId === product.id}
                      onClick={() => handleDelete(product.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === product.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
