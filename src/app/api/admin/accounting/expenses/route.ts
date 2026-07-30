import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import { logActivity, getRequestMeta } from "@/lib/activity-log";
import { EXPENSE_CATEGORIES } from "@/lib/accounting-constants";
import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from "@/lib/expense-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const category = req.nextUrl.searchParams.get("category");

    const expenses = await listExpenses({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      category,
      take: 500,
    });

    return NextResponse.json({
      success: true,
      categories: EXPENSE_CATEGORIES,
      expenses,
    });
  } catch (err) {
    console.error("[expenses GET]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const category = String(body.category || "Other").trim();
    const amount = Number(body.amount);
    const expenseDate = body.expenseDate
      ? new Date(`${String(body.expenseDate).slice(0, 10)}T12:00:00`)
      : new Date();
    const notes = body.notes ? String(body.notes).trim() : null;
    const paymentMethod = body.paymentMethod
      ? String(body.paymentMethod).trim()
      : null;

    if (!title || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Title and a positive amount are required" },
        { status: 400 }
      );
    }

    const userId = session!.user.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const expense = await createExpense({
      title,
      category: EXPENSE_CATEGORIES.includes(
        category as (typeof EXPENSE_CATEGORIES)[number]
      )
        ? category
        : "Other",
      amount,
      expenseDate,
      notes,
      paymentMethod,
      createdById: userId,
    });

    const meta = getRequestMeta(req);
    await logActivity({
      userId,
      action: "EXPENSE_CREATED",
      module: "PAYMENT",
      entityId: expense.id,
      entityName: expense.title,
      description: `${category}: ${amount}`,
      ...meta,
    });

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error("[expenses POST]", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Failed to create expense",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Expense id required" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (body.title != null) data.title = String(body.title).trim();
    if (body.category != null) data.category = String(body.category).trim();
    if (body.amount != null) data.amount = Number(body.amount);
    if (body.expenseDate != null) {
      data.expenseDate = new Date(
        `${String(body.expenseDate).slice(0, 10)}T12:00:00`
      );
    }
    if (body.notes !== undefined) {
      data.notes = body.notes ? String(body.notes).trim() : null;
    }
    if (body.paymentMethod !== undefined) {
      data.paymentMethod = body.paymentMethod
        ? String(body.paymentMethod).trim()
        : null;
    }

    const expense = await updateExpense(id, data);

    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      action: "EXPENSE_UPDATED",
      module: "PAYMENT",
      entityId: expense.id,
      entityName: expense.title,
      ...meta,
    });

    return NextResponse.json({ success: true, expense });
  } catch (err) {
    console.error("[expenses PATCH]", err);
    return NextResponse.json(
      { success: false, message: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Expense id required" },
        { status: 400 }
      );
    }

    const expense = await deleteExpense(id);
    const meta = getRequestMeta(req);
    await logActivity({
      userId: session!.user.id,
      action: "EXPENSE_DELETED",
      module: "PAYMENT",
      entityId: expense.id,
      entityName: expense.title,
      ...meta,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[expenses DELETE]", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
