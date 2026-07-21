"use client";

import { useState } from "react";
import { formatPrice } from "@/utils/formatePrice";

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  price: number;
  image: string | null;
};

type Order = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  totalPrice: number;
  paymentMethod: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
};

type Props = {
  orders: Order[];
};

export default function MyAccountClient({ orders }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
    switch (status) {
      case "APPROVED":
        return `${base} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-yellow-100 text-yellow-800`;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <h3 className="mt-3 text-base font-semibold text-slate-900">No orders yet</h3>
        <p className="mt-1 text-sm text-slate-500">Orders you place will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-lg border border-slate-200 bg-white">
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm font-medium text-slate-900">
                Order #{order.id.slice(0, 8)}
              </span>
              <span className={statusBadge(order.status)}>{order.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">
                {formatPrice(order.totalPrice)}
              </span>
              <svg className={`h-4 w-4 text-slate-400 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedId === order.id && (
            <div className="border-t border-slate-100 px-4 py-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-slate-900">{new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment</p>
                  <p className="text-slate-900 capitalize">{order.paymentMethod === "mtn" ? "MTN Mobile Money" : order.paymentMethod === "momo" ? "MoMo Pay" : "Cash on Delivery"}</p>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-medium text-slate-500 uppercase">Items</p>
                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1.5">
                      <span className="text-slate-900">{item.productTitle} × {item.quantity}</span>
                      <span className="font-medium text-slate-900">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500">Shipping to: {order.shippingAddress}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}