"use client";

import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";

type Activity = {
  id: string;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  action: string;
  module: string;
  entityId: string | null;
  entityName: string | null;
  description: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
  user?: { id: string; name: string | null; email: string | null; role: string };
};

const MODULES = ["PRODUCT", "CATEGORY", "INVENTORY", "ORDER", "USER", "AUTH", "SETTINGS"];
const ACTIONS = [
  "PRODUCT_CREATED", "PRODUCT_UPDATED", "PRODUCT_DELETED", "PRODUCT_PRICE_CHANGED",
  "STOCK_IN", "STOCK_OUT", "STOCK_ADJUSTED", "ORDER_STATUS_CHANGED",
  "USER_CREATED", "USER_UPDATED", "USER_DELETED", "LOGIN", "LOGIN_FAILED",
];

function formatChanges(oldVal: Record<string, unknown> | null, newVal: Record<string, unknown> | null) {
  if (!oldVal && !newVal) return null;
  const changes: string[] = [];
  if (oldVal && newVal) {
    for (const key of Object.keys(newVal)) {
      if (JSON.stringify(oldVal[key]) !== JSON.stringify(newVal[key])) {
        changes.push(`${key}: ${oldVal[key]} → ${newVal[key]}`);
      }
    }
  } else if (newVal) {
    for (const [key, val] of Object.entries(newVal)) {
      changes.push(`${key}: ${val}`);
    }
  }
  return changes;
}

export default function AdminActivitiesClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState("");
  const [action, setAction] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (module) params.set("module", module);
    if (action) params.set("action", action);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    const res = await fetch(`/api/admin/activities?${params}`);
    const data = await res.json();
    if (data.success) {
      setActivities(data.activities);
      setTotalPages(data.pagination.totalPages);
    }
    setLoading(false);
  }, [module, action, startDate, endDate, page]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={module}
            onChange={(e) => { setModule(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Modules</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All Actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02AAA4] border-t-transparent" />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-500">No activities found for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const changes = formatChanges(a.oldValue, a.newValue);
            return (
              <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#02AAA4]/10 text-sm font-bold text-[#02AAA4]">
                      {(a.userName || a.user?.name || "S")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {a.userName || a.user?.name || "System"}
                        {a.userRole && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {a.userRole.replace("_", " ")}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-[#02AAA4]">
                        {a.action.replace(/_/g, " ")}
                      </p>
                      {a.entityName && (
                        <p className="text-sm text-slate-700">{a.entityName}</p>
                      )}
                      {a.description && (
                        <p className="text-sm text-slate-500">{a.description}</p>
                      )}
                      {changes && changes.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {changes.map((c) => (
                            <li key={c} className="text-xs text-slate-500 font-mono bg-slate-50 rounded px-2 py-1">
                              {c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {a.module}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">
                      {dayjs(a.createdAt).format("MMM D, YYYY h:mm A")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
