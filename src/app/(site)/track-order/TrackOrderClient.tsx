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
  paymentEvidence?: string | null;
  shippingName: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "COMPLETED",
] as const;

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

function normalizeStatus(status: string) {
  if (status === "APPROVED") return "CONFIRMED";
  return status;
}

function stepIndex(status: string) {
  const normalized = normalizeStatus(status);
  if (normalized === "REJECTED") return -1;
  const idx = STATUS_STEPS.indexOf(normalized as (typeof STATUS_STEPS)[number]);
  return idx >= 0 ? idx : 0;
}

export default function TrackOrderClient({ orders }: { orders: Order[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(orders[0]?.id ?? null);

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">No orders to track yet</h2>
        <p className="mt-3 text-sm text-slate-600">
          When you place an order, its status will appear here.
        </p>
        <a
          href="/shop-with-sidebar"
          className="mt-6 inline-flex rounded-lg bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e7680d]"
        >
          Start shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const expanded = expandedId === order.id;
        const currentStep = stepIndex(order.status);
        const rejected = order.status === "REJECTED";

        return (
          <div
            key={order.id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : order.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
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
                  Placed{" "}
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
              <div className="border-t border-slate-100 px-4 py-5 sm:px-6">
                {rejected ? (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    This order was rejected. Contact support if you need help.
                  </p>
                ) : (
                  <ol className="mb-5 grid gap-2 sm:grid-cols-5">
                    {STATUS_STEPS.map((step, index) => {
                      const done = index <= currentStep;
                      return (
                        <li
                          key={step}
                          className={`rounded-lg border px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide ${
                            done
                              ? "border-[#1c2ea3] bg-[#eef2ff] text-[#1c2ea3]"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                          }`}
                        >
                          {step.replace(/_/g, " ")}
                        </li>
                      );
                    })}
                  </ol>
                )}

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Payment</p>
                    <p className="mt-0.5 capitalize text-slate-800">
                      {String(order.paymentMethod).split("|")[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500">Ship to</p>
                    <p className="mt-0.5 text-slate-800">{order.shippingAddress}</p>
                  </div>
                </div>

                {order.paymentEvidence && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-slate-500">Payment evidence</p>
                    <a
                      href={order.paymentEvidence}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-sm font-semibold text-[#1c2ea3] hover:underline"
                    >
                      View uploaded proof
                    </a>
                  </div>
                )}

                <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between px-4 py-2.5 text-sm"
                    >
                      <span className="text-slate-700">
                        {item.productTitle} × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
