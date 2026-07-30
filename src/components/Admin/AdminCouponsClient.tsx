"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
  });

  const load = async () => {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    if (data.success) setCoupons(data.coupons || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        minOrderAmount: form.minOrderAmount || null,
        maxUses: form.maxUses || null,
        expiresAt: form.expiresAt || null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Coupon created");
      setForm({
        code: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: "",
        maxUses: "",
        expiresAt: "",
      });
      load();
    } else {
      toast.error(data.message || "Failed to create coupon");
    }
    setSaving(false);
  };

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(coupon.isActive ? "Coupon deactivated" : "Coupon activated");
      load();
    } else {
      toast.error(data.message || "Update failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      toast.success("Coupon deleted");
      load();
    } else {
      toast.error(data.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff7a1a] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3"
      >
        <h2 className="md:col-span-3 text-lg font-bold text-slate-900">Create discount code</h2>
        <input
          required
          placeholder="CODE (e.g. BACKTOSCHOOL)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="percentage">Percentage %</option>
          <option value="fixed">Fixed RWF</option>
        </select>
        <input
          type="number"
          min={1}
          required
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Discount value"
        />
        <input
          type="number"
          min={0}
          placeholder="Min order amount (optional)"
          value={form.minOrderAmount}
          onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min={1}
          placeholder="Max uses (optional)"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="md:col-span-3 rounded-lg bg-[#ff7a1a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e7680d] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create coupon"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Code</th>
              <th className="px-4 py-3 text-left">Discount</th>
              <th className="px-4 py-3 text-left">Uses</th>
              <th className="px-4 py-3 text-left">Expires</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "percentage"
                    ? `${c.discountValue}%`
                    : `${c.discountValue.toLocaleString("en-RW")} RWF`}
                </td>
                <td className="px-4 py-3">
                  {c.usedCount}
                  {c.maxUses != null ? ` / ${c.maxUses}` : ""}
                </td>
                <td className="px-4 py-3">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className="text-xs font-semibold text-[#1c2ea3] hover:underline"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No coupons yet. Create your first discount code above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
