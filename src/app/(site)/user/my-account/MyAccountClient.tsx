"use client";

import { useState } from "react";
import { formatPrice } from "@/utils/formatePrice";

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  shippingName: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function MyAccountClient({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-slate-800">No orders yet</p>
        <p className="mt-1 text-sm text-slate-500">When you place an order, it will show up here.</p>
        <a
          href="/shop-without-sidebar"
          className="mt-4 inline-flex rounded-xl bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-dark"
        >
          Start shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const expanded = expandedId === order.id;
        return (
          <div
            key={order.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue/30"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : order.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      statusStyles[order.status] || "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-base font-bold text-slate-900">
                  {formatPrice(order.totalPrice)}
                </span>
                <svg
                  className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Payment</p>
                    <p className="mt-0.5 capitalize text-slate-800">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Ship to</p>
                    <p className="mt-0.5 text-slate-800">{order.shippingAddress}</p>
                  </div>
                </div>
                <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="text-slate-800">
                        {item.productTitle} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>

                {["CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "COMPLETED", "APPROVED"].includes(
                  order.status
                ) && (
                  <a
                    href={`/api/orders/${order.id}/receipt`}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#02AAA4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#028f86]"
                  >
                    Download PDF receipt
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
