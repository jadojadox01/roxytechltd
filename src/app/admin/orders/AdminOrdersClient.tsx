"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatPrice } from "@/utils/formatePrice";
import toast from "react-hot-toast";

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
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  items: OrderItem[];
  user: { id: string; name: string | null; email: string };
};

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch orders");
      }
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      setUpdatingId(orderId);
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order");
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(
        newStatus === "APPROVED"
          ? "Order approved successfully"
          : "Order rejected"
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = searchQuery === "" || 
        order.shippingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingPhone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const statusBadge = (status: string) => {
    const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";
    switch (status) {
      case "APPROVED":
        return `${base} bg-green-100 text-green-800`;
      case "REJECTED":
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-yellow-100 text-yellow-800`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071CE] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, phone, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#0071CE] focus:ring-2 focus:ring-[#0071CE]/20 bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No orders found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {searchQuery || statusFilter !== "ALL" 
              ? "Try adjusting your filters" 
              : "Orders placed by customers will appear here"}
          </p>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Order Header */}
            <button
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              className="flex w-full items-start sm:items-center justify-between px-4 sm:px-5 py-4 text-left gap-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{order.shippingName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className={statusBadge(order.status)}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <span className="font-semibold text-slate-900 text-sm sm:text-base whitespace-nowrap">
                  {formatPrice(order.totalPrice)}
                </span>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform shrink-0 ${
                    expandedId === order.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Always-visible quick actions for pending orders */}
            {order.status === "PENDING" && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 sm:px-5 py-3">
                <span className="text-xs font-medium text-slate-500">Quick action:</span>
                <button
                  onClick={() => handleUpdateStatus(order.id, "APPROVED")}
                  disabled={updatingId === order.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {updatingId === order.id ? "Updating..." : "Approve"}
                </button>
                <button
                  onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                  disabled={updatingId === order.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-600 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Reject
                </button>
              </div>
            )}

            {/* Order Details */}
            {expandedId === order.id && (
              <div className="border-t border-slate-100 px-4 sm:px-5 py-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Shipping Details
                    </h4>
                    <div className="space-y-1.5 text-sm text-slate-700">
                      <p className="break-words"><span className="font-medium">Email:</span> {order.shippingEmail}</p>
                      <p className="break-words"><span className="font-medium">Phone:</span> {order.shippingPhone}</p>
                      <p className="break-words"><span className="font-medium">Address:</span> {order.shippingAddress}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </h4>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, "APPROVED")}
                        disabled={updatingId === order.id || order.status === "APPROVED"}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                      >
                        {updatingId === order.id ? "Updating..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "REJECTED")}
                        disabled={updatingId === order.id || order.status === "REJECTED"}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                      >
                        {updatingId === order.id ? "Updating..." : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Items ({order.items.length})
                  </h4>
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-3 sm:px-4 py-2.5 text-sm gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productTitle}
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">{item.productTitle}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium text-slate-900 whitespace-nowrap shrink-0">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}