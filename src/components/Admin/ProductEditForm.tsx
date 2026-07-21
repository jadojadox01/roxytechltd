"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type CategoryOption = {
  id: string;
  title: string;
  slug: string;
};

type ProductEditFormProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    description?: string | null;
    price: string | number | null;
    discountedPrice?: string | number | null;
    quantity?: number | null;
    categoryId?: string | null;
    isNewArrival?: boolean | null;
    images?: string[] | null;
  };
  categories: CategoryOption[];
};

export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const [title, setTitle] = useState(product.title || "");
  const [slug, setSlug] = useState(product.slug || "");
  const [shortDescription, setShortDescription] = useState(product.shortDescription || "");
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(String(product.price ?? ""));
  const [discountedPrice, setDiscountedPrice] = useState(
    product.discountedPrice ? String(product.discountedPrice) : ""
  );
  const [quantity, setQuantity] = useState(Number(product.quantity ?? 0));
  const [categoryId, setCategoryId] = useState(product.categoryId || "");
  const [isNewArrival, setIsNewArrival] = useState(Boolean(product.isNewArrival));

  // Existing images from DB — user can remove individual ones
  const [existingImages, setExistingImages] = useState<string[]>(
    Array.isArray(product.images) ? product.images.filter(Boolean) : []
  );
  // New files the user is adding
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20 transition";
  const labelClass = "block text-sm font-medium text-slate-700";

  function handleNewFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    // reset input so the same file can be re-added if needed
    e.target.value = "";
  }

  function removeExisting(idx: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNew(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("shortDescription", shortDescription);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("discountedPrice", discountedPrice);
      formData.append("quantity", String(quantity));
      if (categoryId) formData.append("categoryId", categoryId);
      formData.append("isNewArrival", String(isNewArrival));

      // Send kept existing images as JSON so the API can merge them
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append new image files
      newFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update product");
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  }

  const totalImages = existingImages.length + newFiles.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">

      {/* Title + Slug */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} required />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Category</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* New Arrival */}
      <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isNewArrival}
          onChange={(e) => setIsNewArrival(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#0071CE] focus:ring-[#0071CE]"
        />
        <span className="text-sm font-medium text-slate-700">Mark as New Arrival
          <span className="block text-xs font-normal text-slate-500">Show this product in the homepage "New Arrivals" section.</span>
        </span>
      </label>

      {/* Descriptions */}
      <div>
        <label className={labelClass}>Short description</label>
        <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
      </div>

      {/* Pricing + Quantity */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Discounted price</label>
          <input
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            placeholder="Leave blank for no discount"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Quantity</label>
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={inputClass} />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className={labelClass}>
          Images{" "}
          <span className="font-normal text-slate-500">({totalImages} total)</span>
        </label>

        {/* Grid of current + new images */}
        {totalImages > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {existingImages.map((src, idx) => (
              <div key={`existing-${idx}`} className="relative group">
                <img
                  src={src}
                  alt={`Image ${idx + 1}`}
                  className="h-20 w-20 rounded-lg object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => removeExisting(idx)}
                  title="Remove image"
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs shadow opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 py-0.5 text-center text-[10px] text-white">
                  Saved
                </span>
              </div>
            ))}

            {newPreviews.map((src, idx) => (
              <div key={`new-${idx}`} className="relative group">
                <img
                  src={src}
                  alt={`New ${idx + 1}`}
                  className="h-20 w-20 rounded-lg object-cover border-2 border-[#0071CE]"
                />
                <button
                  type="button"
                  onClick={() => removeNew(idx)}
                  title="Remove"
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs shadow opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
                <span className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-[#0071CE]/70 py-0.5 text-center text-[10px] text-white">
                  New
                </span>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleNewFiles}
          className="mt-3 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0071CE] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#005fb0]"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          Existing images are kept unless you remove them. Add new images to append.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#0071CE] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#005fb0] transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
