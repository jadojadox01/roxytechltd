"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/utils/formatePrice";
import Link from "next/link";

type Summary = {
  revenue: number;
  orders: number;
  units: number;
};

export default function StoreKeeperReportsClient() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{
    today: Summary;
    week: Summary;
    month: Summary;
  } | null>(null);
  const [topProducts, setTopProducts] = useState<
    Array<{ title: string; units: number; revenue: number }>
  >([]);
  const [categories, setCategories] = useState<
    Array<{ title: string; units: number; revenue: number }>
  >([]);

  useEffect(() => {
    fetch("/api/storekeeper/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSummary(data.summary);
          setTopProducts(data.topProducts || []);
          setCategories(data.categoryBreakdown || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Today revenue", value: formatPrice(summary?.today.revenue || 0), sub: `${summary?.today.orders || 0} orders` },
    { label: "Last 7 days", value: formatPrice(summary?.week.revenue || 0), sub: `${summary?.week.units || 0} units` },
    { label: "This month", value: formatPrice(summary?.month.revenue || 0), sub: `${summary?.month.orders || 0} orders` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
          <p className="mt-1 text-sm text-slate-600">Completed-order performance for operations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/reports/export?type=orders"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Export orders CSV
          </a>
          <a
            href="/api/reports/export?type=inventory"
            className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            Export inventory CSV
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Top products</h2>
          <ul className="mt-4 space-y-2">
            {topProducts.length === 0 && (
              <li className="text-sm text-slate-500">No completed sales yet.</li>
            )}
            {topProducts.map((p) => (
              <li key={p.title} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{p.title}</span>
                <span className="text-slate-500">{p.units} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Category breakdown</h2>
          <ul className="mt-4 space-y-2">
            {categories.length === 0 && (
              <li className="text-sm text-slate-500">No category sales data yet.</li>
            )}
            {categories.map((c) => (
              <li key={c.title} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-slate-800">{c.title}</span>
                <span className="text-slate-500">{formatPrice(c.revenue)}</span>
              </li>
            ))}
          </ul>
          <Link href="/storekeeper/orders" className="mt-4 inline-block text-sm font-semibold text-amber-700 hover:underline">
            Open order queue →
          </Link>
        </div>
      </div>
    </div>
  );
}
