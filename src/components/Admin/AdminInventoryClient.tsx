"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formatePrice";

type InventoryItem = {
  id: string;
  title: string;
  slug: string;
  quantity: number;
  price: number;
  sku: string | null;
  status: string;
  category: { title: string } | null;
  inventory: { lowStockThreshold: number } | null;
};

export default function AdminInventoryClient() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockModal, setStockModal] = useState<{ productId: string; title: string } | null>(null);
  const [stockForm, setStockForm] = useState({ type: "STOCK_IN", quantity: 1, reason: "", supplierName: "" });
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    const res = await fetch("/api/admin/inventory");
    const data = await res.json();
    if (data.success) {
      setItems(data.inventory.map((p: InventoryItem & { price: string }) => ({
        ...p,
        price: Number(p.price),
      })));
      setLowStock(data.lowStock.map((p: InventoryItem & { price: string }) => ({
        ...p,
        price: Number(p.price),
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchInventory(); }, []);

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModal) return;
    setSaving(true);
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: stockModal.productId, ...stockForm }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Stock updated");
      setStockModal(null);
      setStockForm({ type: "STOCK_IN", quantity: 1, reason: "", supplierName: "" });
      fetchInventory();
    } else {
      toast.error(data.message || "Failed to update stock");
    }
    setSaving(false);
  };

  const filtered = items.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02AAA4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">⚠️ Low Stock Alert ({lowStock.length} products)</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                {p.title}: {p.quantity} left
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Stock</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Value</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const threshold = p.inventory?.lowStockThreshold ?? 5;
              const isLow = p.quantity <= threshold;
              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.title}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category?.title || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${isLow ? "text-red-600" : "text-slate-900"}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatPrice(p.price * p.quantity)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      p.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setStockModal({ productId: p.id, title: p.title })}
                      className="text-xs font-medium text-[#02AAA4] hover:underline"
                    >
                      Manage Stock
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleStockUpdate} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-900">Stock Update — {stockModal.title}</h3>
            <select
              value={stockForm.type}
              onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="STOCK_IN">Stock In (Receive)</option>
              <option value="STOCK_OUT">Stock Out (Remove)</option>
              <option value="ADJUSTMENT">Adjustment (Set exact)</option>
            </select>
            <input
              type="number"
              min={1}
              required
              placeholder="Quantity"
              value={stockForm.quantity}
              onChange={(e) => setStockForm({ ...stockForm, quantity: parseInt(e.target.value) || 1 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {stockForm.type === "STOCK_IN" && (
              <input
                placeholder="Supplier name (optional)"
                value={stockForm.supplierName}
                onChange={(e) => setStockForm({ ...stockForm, supplierName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            )}
            <input
              placeholder="Reason / notes"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-[#02AAA4] py-2 text-sm font-medium text-white hover:bg-[#028f86] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Stock"}
              </button>
              <button
                type="button"
                onClick={() => setStockModal(null)}
                className="flex-1 rounded-lg border py-2 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
