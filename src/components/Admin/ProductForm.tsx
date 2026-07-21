"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CategoryOption = {
  id: string;
  title: string;
  slug: string;
};

export default function ProductForm({ categories }: { categories: CategoryOption[] }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image3, setImage3] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !slug.trim() || !price.trim()) {
      setError("Title, slug, and price are required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("shortDescription", shortDescription);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("quantity", String(quantity));
      if (categoryId) formData.append("categoryId", categoryId);
      formData.append("isNewArrival", String(isNewArrival));
      if (image1) formData.append("images", image1);
      if (image2) formData.append("images", image2);
      if (image3) formData.append("images", image3);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to create product');
      }
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
          <input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-[#0071CE]" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Slug</label>
          <input required value={slug} onChange={e => setSlug(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-[#0071CE]" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE]">
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Short description</label>
        <input value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE]" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE]" rows={4} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Image 1</label>
          <input type="file" accept="image/*" onChange={e => setImage1(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Image 2</label>
          <input type="file" accept="image/*" onChange={e => setImage2(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Image 3</label>
          <input type="file" accept="image/*" onChange={e => setImage3(e.target.files?.[0] ?? null)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Price</label>
          <input required value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE]" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Quantity</label>
          <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE]" />
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isNewArrival}
          onChange={e => setIsNewArrival(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#0071CE] focus:ring-[#0071CE]"
        />
        <span className="text-sm font-medium text-slate-700">Mark as New Arrival
          <span className="block text-xs font-normal text-slate-500">Show this product in the homepage "New Arrivals" section.</span>
        </span>
      </label>
      <div>
        <button disabled={loading} className="inline-flex items-center justify-center rounded-lg bg-[#0071CE] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Saving...' : 'Save product'}</button>
      </div>
    </form>
  );
}
