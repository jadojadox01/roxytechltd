"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { formatPrice } from "@/utils/formatePrice";
import { PackageIcon, ClockIcon, GridIcon } from "@/assets/icons/home";

type Stats = {
  totalProducts: number;
  pendingOrders: number;
  preparingOrders: number;
  lowStockCount: number;
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",
};

export default function StoreKeeperDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStock, setLowStock] = useState<{ id: string; title: string; quantity: number }[]>([]);
  const [activities, setActivities] = useState<
    Array<{ id: string; userName: string | null; action: string; entityName: string | null; createdAt: string }>
  >([]);
  const [orders, setOrders] = useState<
    Array<{ id: string; shippingName: string; status: string; totalPrice: number; createdAt: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/storekeeper/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setLowStock(data.lowStockProducts || []);
          setActivities(data.recentActivities || []);
          setOrders(data.recentOrders || []);
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
    { label: "Products in catalog", value: stats?.totalProducts || 0, icon: PackageIcon, tone: "text-amber-700 bg-amber-100" },
    { label: "Pending orders", value: stats?.pendingOrders || 0, icon: ClockIcon, tone: "text-orange-700 bg-orange-100" },
    { label: "In preparation", value: stats?.preparingOrders || 0, icon: GridIcon, tone: "text-blue-700 bg-blue-100" },
    { label: "Low stock items", value: stats?.lowStockCount || 0, icon: PackageIcon, tone: "text-red-700 bg-red-100" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/80 p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Orders to fulfill</h3>
            <Link href="/storekeeper/orders" className="text-sm font-semibold text-amber-700 hover:underline">
              Open queue
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No active orders right now.</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{o.shippingName}</p>
                    <span
                      className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        statusColor[o.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatPrice(o.totalPrice)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Stock alerts</h3>
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Inventory levels look good.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between rounded-xl border border-red-100 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-800">{p.title}</span>
                  <span className="font-bold text-red-600">{p.quantity} left</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/storekeeper/inventory"
            className="mt-4 inline-flex text-sm font-semibold text-amber-800 hover:underline"
          >
            Update inventory
          </Link>
        </div>
      </div>

      {activities.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Recent activity</h3>
          <ul className="space-y-2">
            {activities.map((a) => (
              <li
                key={a.id}
                className="flex justify-between rounded-xl bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{a.userName || "System"}</p>
                  <p className="text-slate-500">
                    {a.action.replace(/_/g, " ")}
                    {a.entityName && ` · ${a.entityName}`}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {dayjs(a.createdAt).format("MMM D, h:mm A")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
