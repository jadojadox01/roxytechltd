"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/utils/formatePrice";
import dayjs from "dayjs";
import {
  TrendingIcon,
  PackageIcon,
  UsersIcon,
  TagIcon,
  GridIcon,
  ClockIcon,
} from "@/assets/icons/home";
import type { IconProps } from "@/types/icon-props";

type Stats = {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  pendingOrders: number;
  lowStockCount: number;
};

type Activity = {
  id: string;
  userName: string | null;
  userRole: string | null;
  action: string;
  module: string;
  entityName: string | null;
  createdAt: string;
};

type LowStockProduct = {
  id: string;
  title: string;
  quantity: number;
};

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setActivities(data.recentActivities || []);
          setLowStock(data.lowStockProducts || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal border-t-transparent" />
      </div>
    );
  }

  const cards: {
    label: string;
    value: string | number;
    accent: string;
    icon: React.ComponentType<IconProps>;
  }[] = [
    { label: "Total Sales", value: formatPrice(stats?.totalSales || 0), accent: "from-emerald-500 to-teal-600", icon: TrendingIcon },
    { label: "Total Orders", value: stats?.totalOrders || 0, accent: "from-blue-500 to-indigo-600", icon: PackageIcon },
    { label: "Customers", value: stats?.totalCustomers || 0, accent: "from-violet-500 to-purple-600", icon: UsersIcon },
    { label: "Products", value: stats?.totalProducts || 0, accent: "from-amber-500 to-orange-600", icon: TagIcon },
    { label: "Inventory Value", value: formatPrice(stats?.inventoryValue || 0), accent: "from-teal-500 to-cyan-600", icon: GridIcon },
    { label: "Pending Orders", value: stats?.pendingOrders || 0, accent: "from-orange-500 to-red-500", icon: ClockIcon },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-10 transition group-hover:opacity-20`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Low stock alerts</h3>
            <Link href="/admin/inventory" className="text-sm font-medium text-teal hover:underline">
              Manage inventory
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-slate-500">
              All products are well stocked.
            </p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-red-100 bg-white px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-800">{p.title}</span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                    {p.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Recent activity</h3>
            <Link href="/admin/activities" className="text-sm font-medium text-teal hover:underline">
              View log
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-slate-500">
              No activity recorded yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {activities.slice(0, 6).map((a) => (
                <li key={a.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {a.userName || "System"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {a.action.replace(/_/g, " ")}
                        {a.entityName && ` · ${a.entityName}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">
                      {dayjs(a.createdAt).format("MMM D, h:mm A")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Quick actions
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { title: "Products", href: "/admin/products" },
            { title: "Orders", href: "/admin/orders" },
            { title: "Users", href: "/admin/users" },
            { title: "Settings", href: "/admin/settings" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700 transition hover:border-teal hover:bg-teal/5 hover:text-teal"
            >
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
