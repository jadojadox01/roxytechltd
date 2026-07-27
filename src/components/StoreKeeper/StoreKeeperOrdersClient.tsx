"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatPrice } from "@/utils/formatePrice";
import toast from "react-hot-toast";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "COMPLETED"
  | "REJECTED";

type OrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  price: number;
  image: string | null;
};

type Order = {
  id: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  user: { id: string; name: string | null; email: string };
};

const WORKFLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_DELIVERY",
  "COMPLETED",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_DELIVERY: "Ready for Delivery",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

function getNextStatus(current: OrderStatus): OrderStatus | null {
  const idx = WORKFLOW.indexOf(current);
  if (idx === -1 || idx >= WORKFLOW.length - 1) return null;
  return WORKFLOW[idx + 1];
}

export default function StoreKeeperOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (data.success) setOrders(data.orders || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast.success(`Order updated to ${STATUS_LABELS[newStatus]}`);
    } else {
      toast.error(data.message || "Failed to update");
    }
    setUpdatingId(null);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        searchQuery === "" ||
        order.shippingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      PREPARING: "bg-indigo-100 text-indigo-800",
      READY_FOR_DELIVERY: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-800"}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02AAA4] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Workflow Legend */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Order Workflow</p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {WORKFLOW.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className={statusBadge(s)}>{STATUS_LABELS[s]}</span>
              {i < WORKFLOW.length - 1 && <span className="text-slate-400">→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm bg-white"
        >
          <option value="ALL">All Status</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-600">{filteredOrders.length} orders</p>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-slate-500">
          No orders found.
        </div>
      ) : (
        filteredOrders.map((order) => {
          const nextStatus = getNextStatus(order.status);
          return (
            <div key={order.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <button
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{order.shippingName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleString()} · #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className={statusBadge(order.status)}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <span className="font-semibold">{formatPrice(order.totalPrice)}</span>
              </button>

              {order.status !== "COMPLETED" && order.status !== "REJECTED" && (
                <div className="flex flex-wrap gap-2 border-t px-5 py-3">
                  {nextStatus && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, nextStatus)}
                      disabled={updatingId === order.id}
                      className="rounded-lg bg-[#02AAA4] px-4 py-2 text-sm font-medium text-white hover:bg-[#028f86] disabled:opacity-50"
                    >
                      {updatingId === order.id ? "Updating..." : `Move to ${STATUS_LABELS[nextStatus]}`}
                    </button>
                  )}
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                      disabled={updatingId === order.id}
                      className="rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}

              {expandedId === order.id && (
                <div className="border-t px-5 py-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Email:</span> {order.shippingEmail}</p>
                      <p><span className="font-medium">Phone:</span> {order.shippingPhone}</p>
                      <p><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Items</h4>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 text-sm border-b last:border-0">
                        <span>{item.productTitle} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
