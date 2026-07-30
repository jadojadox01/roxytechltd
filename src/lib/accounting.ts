import { prismaClientInstance } from "@/lib/prismaDB";
import { listExpenses } from "@/lib/expense-db";
import {
  INCOME_ORDER_STATUSES,
  type PeriodKey,
} from "@/lib/accounting-constants";

export {
  INCOME_ORDER_STATUSES,
  EXPENSE_CATEGORIES,
  type PeriodKey,
} from "@/lib/accounting-constants";


export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function resolvePeriod(
  period: PeriodKey,
  from?: string | null,
  to?: string | null
): { from: Date; to: Date; label: string } {
  const now = new Date();
  const toDate = to ? endOfDay(new Date(to)) : endOfDay(now);

  if (period === "custom" && from) {
    return {
      from: startOfDay(new Date(from)),
      to: toDate,
      label: "Custom range",
    };
  }

  if (period === "today") {
    return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
  }

  if (period === "week") {
    const fromDate = startOfDay(now);
    fromDate.setDate(fromDate.getDate() - 6);
    return { from: fromDate, to: endOfDay(now), label: "Last 7 days" };
  }

  if (period === "year") {
    return {
      from: new Date(now.getFullYear(), 0, 1),
      to: endOfDay(now),
      label: "This year",
    };
  }

  // month (default)
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: endOfDay(now),
    label: "This month",
  };
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getAccountingSummary(from: Date, to: Date) {
  const [orders, expenses] = await Promise.all([
    prismaClientInstance.order.findMany({
      where: {
        status: { in: [...INCOME_ORDER_STATUSES] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        totalPrice: true,
        paymentMethod: true,
        createdAt: true,
        shippingName: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    listExpenses({ from, to, take: 5000 }),
  ]);

  const income = orders.reduce(
    (sum: number, o: { totalPrice: unknown }) => sum + Number(o.totalPrice),
    0
  );
  const expenseTotal = expenses.reduce(
    (sum: number, e: { amount: unknown }) => sum + Number(e.amount),
    0
  );
  const profit = income - expenseTotal;
  const orderCount = orders.length;
  const unitsSold = orders.reduce(
    (sum: number, o: { items: { quantity: number }[] }) =>
      sum + o.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0),
    0
  );

  // Daily cash-flow series
  const byDay: Record<string, { income: number; expenses: number; profit: number }> = {};
  for (const order of orders as Array<{ createdAt: Date; totalPrice: unknown }>) {
    const key = dayKey(new Date(order.createdAt));
    if (!byDay[key]) byDay[key] = { income: 0, expenses: 0, profit: 0 };
    byDay[key].income += Number(order.totalPrice);
  }
  for (const expense of expenses as Array<{ expenseDate: Date; amount: unknown }>) {
    const key = dayKey(new Date(expense.expenseDate));
    if (!byDay[key]) byDay[key] = { income: 0, expenses: 0, profit: 0 };
    byDay[key].expenses += Number(expense.amount);
  }
  const daily = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      income: values.income,
      expenses: values.expenses,
      profit: values.income - values.expenses,
    }));

  // Expense by category
  const byCategory: Record<string, number> = {};
  for (const expense of expenses as Array<{ category: string; amount: unknown }>) {
    byCategory[expense.category] =
      (byCategory[expense.category] || 0) + Number(expense.amount);
  }
  const expenseBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Income by payment method
  const byPayment: Record<string, number> = {};
  for (const order of orders as Array<{ paymentMethod: string; totalPrice: unknown }>) {
    const method = String(order.paymentMethod || "unknown").split("|")[0];
    byPayment[method] = (byPayment[method] || 0) + Number(order.totalPrice);
  }
  const incomeByPayment = Object.entries(byPayment).map(([method, amount]) => ({
    method,
    amount,
  }));

  return {
    totals: {
      income,
      expenses: expenseTotal,
      profit,
      orderCount,
      unitsSold,
      expenseCount: expenses.length,
      marginPercent: income > 0 ? (profit / income) * 100 : 0,
    },
    daily,
    expenseBreakdown,
    incomeByPayment,
    recentOrders: (orders as Array<{
      id: string;
      totalPrice: unknown;
      paymentMethod: string;
      createdAt: Date;
      shippingName: string;
    }>)
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        totalPrice: Number(o.totalPrice),
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        shippingName: o.shippingName,
      })),
    /** Full period orders for PDF/Excel reports (not capped). */
    reportOrders: (orders as Array<{
      id: string;
      totalPrice: unknown;
      paymentMethod: string;
      createdAt: Date;
      shippingName: string;
    }>).map((o) => ({
      id: o.id,
      totalPrice: Number(o.totalPrice),
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      shippingName: o.shippingName,
    })),
    recentExpenses: (expenses as Array<{
      id: string;
      title: string;
      category: string;
      amount: unknown;
      expenseDate: Date;
      notes: string | null;
      paymentMethod: string | null;
      createdBy: { name: string | null; email: string } | null;
    }>).map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: Number(e.amount),
      expenseDate: e.expenseDate,
      notes: e.notes,
      paymentMethod: e.paymentMethod,
      createdBy: e.createdBy,
    })),
  };
}
