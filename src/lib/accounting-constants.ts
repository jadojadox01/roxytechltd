/** Income is recognized when an order is completed (money received / fulfilled). */
export const INCOME_ORDER_STATUSES = ["COMPLETED"] as const;

export const EXPENSE_CATEGORIES = [
  "Inventory purchase",
  "Salaries",
  "Rent",
  "Utilities",
  "Marketing",
  "Transport / delivery",
  "Packaging",
  "Equipment",
  "Fees & taxes",
  "Other",
] as const;

export type PeriodKey = "today" | "week" | "month" | "year" | "custom";
