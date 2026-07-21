"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ProductOption = { id: string; title: string };

type Deal = {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  countdownImage: string | null;
  product: { title: string } | null;
};

export default function AdminDealsClient({ products }: { products: ProductOption[] }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [date, setDate] = useState("");
  const [productId, setProductId] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20 transition";
  const labelClass = "block text-sm font-medium text-slate-700";

  async function loadDeals() {
    try {
      const res = await fetch("/api/admin/deals", { cache: "no-store" });
      const data = await res.json();
      setDeals(data.success ? data.deals : []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subtitle.trim() || !date || !productId) {
      toast.error("Title, subtitle, end date and product are required.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("date", new Date(date).toISOString());
      formData.append("productId", productId);
      if (image) formData.append("image", image);

      const res = await fetch("/api/admin/deals", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to create deal");

      toast.success("Deal created");
      setTitle("");
      setSubtitle("");
      setDate("");
      setProductId("");
      setImage(null);
      loadDeals();
    } catch (err: any) {
      toast.error(err.message || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this deal?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/deals/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete deal");
      setDeals((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deal deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deal");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Create form */}
      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-900">New deal</h2>
        <div>
          <label className={labelClass}>Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}>
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Deal of the Day" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Subtitle</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. Limited time offer" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ends at</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0071CE] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#005fb0]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0071CE] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb0] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Create deal"}
        </button>
      </form>

      {/* Existing deals */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Current deals</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071CE] border-t-transparent" />
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No deals yet. Create one to show a countdown on the homepage.
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal, idx) => (
              <div key={deal.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                {deal.countdownImage ? (
                  <img src={deal.countdownImage} alt={deal.title} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-light-5 text-xs font-semibold text-[#0071CE]">Deal</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-slate-900">{deal.title}</p>
                    {idx === 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-800">LIVE</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{deal.subtitle}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">Product: {deal.product?.title || "—"}</p>
                  <p className="text-xs text-slate-400">Ends: {new Date(deal.date).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  disabled={deletingId === deal.id}
                  onClick={() => handleDelete(deal.id)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {deletingId === deal.id ? "..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
