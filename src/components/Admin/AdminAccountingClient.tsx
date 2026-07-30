"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formatePrice";
import { EXPENSE_CATEGORIES } from "@/lib/accounting-constants";

type Period = "today" | "week" | "month" | "year" | "custom";

type Totals = {
  income: number;
  expenses: number;
  profit: number;
  orderCount: number;
  unitsSold: number;
  expenseCount: number;
  marginPercent: number;
};

type DailyRow = { date: string; income: number; expenses: number; profit: number };
type Breakdown = { category: string; amount: number };
type PaymentRow = { method: string; amount: number };
type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
  paymentMethod: string | null;
};

export default function AdminAccountingClient() {
  const [period, setPeriod] = useState<Period>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("This month");
  const [totals, setTotals] = useState<Totals | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<Breakdown[]>([]);
  const [incomeByPayment, setIncomeByPayment] = useState<PaymentRow[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recentOrders, setRecentOrders] = useState<
    Array<{ id: string; shippingName: string; totalPrice: number; createdAt: string; paymentMethod: string }>
  >([]);

  const [saving, setSaving] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "xlsx">("pdf");
  const [exportType, setExportType] = useState<"full" | "summary" | "daily" | "expenses">(
    "full"
  );
  const [form, setForm] = useState({
    title: "",
    category: "Inventory purchase",
    amount: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "cash",
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (period === "custom") {
        if (from) params.set("from", from);
        if (to) params.set("to", to);
      }
      const res = await fetch(`/api/admin/accounting/summary?${params}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load");
      setLabel(data.period);
      setTotals(data.totals);
      setDaily(data.daily || []);
      setExpenseBreakdown(data.expenseBreakdown || []);
      setIncomeByPayment(data.incomeByPayment || []);
      setExpenses(data.recentExpenses || []);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load accounting");
    } finally {
      setLoading(false);
    }
  }, [period, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const createExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/accounting/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to save");
      toast.success("Expense recorded");
      setForm({
        title: "",
        category: "Inventory purchase",
        amount: "",
        expenseDate: new Date().toISOString().slice(0, 10),
        paymentMethod: "cash",
        notes: "",
      });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    const res = await fetch(`/api/admin/accounting/expenses?id=${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) {
      toast.error(data.message || "Delete failed");
      return;
    }
    toast.success("Expense deleted");
    await load();
  };

  const exportUrl = (type: string, format: "pdf" | "xlsx" = exportFormat) => {
    const params = new URLSearchParams({ period, type, format });
    if (period === "custom") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    }
    return `/api/admin/accounting/export?${params}`;
  };

  const maxDaily = Math.max(
    1,
    ...daily.map((d) => Math.max(d.income, d.expenses, Math.abs(d.profit)))
  );

  if (loading && !totals) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1c2ea3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <p className="text-sm text-slate-600">
          Showing: <span className="font-semibold text-slate-900">{label}</span>
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
            <option value="custom">Custom range</option>
          </select>
          {period === "custom" && (
            <>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </>
          )}
          <select
            value={exportType}
            onChange={(e) =>
              setExportType(e.target.value as "full" | "summary" | "daily" | "expenses")
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="full">Full report</option>
            <option value="summary">Summary</option>
            <option value="daily">Daily cash flow</option>
            <option value="expenses">Expenses only</option>
          </select>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "pdf" | "xlsx")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="xlsx">Excel</option>
          </select>
          <a
            href={exportUrl(exportType, exportFormat)}
            className="rounded-lg bg-[#1c2ea3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16257e]"
          >
            Download {exportFormat === "pdf" ? "PDF" : "Excel"}
          </a>
          <a
            href={exportUrl(exportType, exportFormat === "pdf" ? "xlsx" : "pdf")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {exportFormat === "pdf" ? "Excel" : "PDF"} instead
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Income received", value: formatPrice(totals?.income || 0), tone: "text-emerald-700 bg-emerald-50 border-emerald-100" },
          { label: "Expenses", value: formatPrice(totals?.expenses || 0), tone: "text-red-700 bg-red-50 border-red-100" },
          { label: "Net profit", value: formatPrice(totals?.profit || 0), tone: (totals?.profit || 0) >= 0 ? "text-[#1c2ea3] bg-[#eef2ff] border-[#d4ddff]" : "text-red-700 bg-red-50 border-red-100" },
          { label: "Profit margin", value: `${(totals?.marginPercent || 0).toFixed(1)}%`, tone: "text-[#ff7a1a] bg-[#fff2e8] border-[#ffd9bd]" },
        ].map((card) => (
          <div key={card.label} className={`rounded-2xl border p-5 ${card.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Completed orders</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totals?.orderCount || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Units sold</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totals?.unitsSold || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Expense records</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totals?.expenseCount || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Daily cash flow</h2>
          <p className="mt-1 text-xs text-slate-500">Income vs expenses by day</p>
          <div className="mt-4 space-y-3">
            {daily.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No activity in this period.</p>
            )}
            {daily.map((row) => (
              <div key={row.date}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                  <span>{row.date}</span>
                  <span className={row.profit >= 0 ? "text-emerald-700" : "text-red-600"}>
                    Profit {formatPrice(row.profit)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(row.income / maxDaily) * 100}%` }}
                      title={`Income ${formatPrice(row.income)}`}
                    />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-red-400"
                      style={{ width: `${(row.expenses / maxDaily) * 100}%` }}
                      title={`Expenses ${formatPrice(row.expenses)}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Expenses
            </span>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Expenses by category</h2>
            <ul className="mt-4 space-y-2">
              {expenseBreakdown.length === 0 && (
                <li className="text-sm text-slate-500">No expenses recorded yet.</li>
              )}
              {expenseBreakdown.map((item) => (
                <li
                  key={item.category}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{item.category}</span>
                  <span className="text-slate-600">{formatPrice(item.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Income by payment method</h2>
            <ul className="mt-4 space-y-2">
              {incomeByPayment.length === 0 && (
                <li className="text-sm text-slate-500">No completed order income yet.</li>
              )}
              {incomeByPayment.map((item) => (
                <li
                  key={item.method}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="font-medium uppercase text-slate-800">{item.method}</span>
                  <span className="text-emerald-700">{formatPrice(item.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={createExpense}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Record expense</h2>
          <input
            required
            placeholder="Expense title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min={1}
            step="1"
            placeholder="Amount (RWF)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            required
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="cash">Cash</option>
            <option value="momo">MTN MoMo</option>
            <option value="airtel">Airtel Money</option>
            <option value="bank">Bank transfer</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
          <textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-[#ff7a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#e7680d] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add expense"}
          </button>
        </form>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Expenses in period</h2>
            <a
              href={exportUrl("expenses", exportFormat)}
              className="text-sm font-semibold text-[#1c2ea3] hover:underline"
            >
              Export expenses ({exportFormat === "pdf" ? "PDF" : "Excel"})
            </a>
          </div>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {expenses.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No expenses in this period.</p>
            )}
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{expense.title}</p>
                  <p className="text-xs text-slate-500">
                    {expense.category} · {new Date(expense.expenseDate).toLocaleDateString()}
                    {expense.paymentMethod ? ` · ${expense.paymentMethod}` : ""}
                  </p>
                  {expense.notes && (
                    <p className="mt-1 text-xs text-slate-500">{expense.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatPrice(expense.amount)}</p>
                  <button
                    type="button"
                    onClick={() => deleteExpense(expense.id)}
                    className="mt-1 text-xs font-semibold text-slate-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent income (completed orders)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    No completed orders in this period.
                  </td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">#{order.id.slice(0, 8)}</td>
                  <td className="px-3 py-2">{order.shippingName}</td>
                  <td className="px-3 py-2 uppercase">{String(order.paymentMethod).split("|")[0]}</td>
                  <td className="px-3 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-semibold text-emerald-700">
                    {formatPrice(order.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
