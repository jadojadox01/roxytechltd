import { randomUUID } from "crypto";
import { prismaClientInstance } from "@/lib/prismaDB";

export type ExpenseRow = {
  id: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  notes: string | null;
  paymentMethod: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: { name: string | null; email: string } | null;
};

type RawExpense = {
  id: string;
  title: string;
  category: string;
  amount: unknown;
  expenseDate: Date;
  notes: string | null;
  paymentMethod: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdByName?: string | null;
  createdByEmail?: string | null;
};

let expenseSchemaReady: Promise<void> | null = null;

/** Creates Expense table/indexes if missing (migration recorded but table absent). */
export function ensureExpenseSchema() {
  if (!expenseSchemaReady) {
    expenseSchemaReady = (async () => {
      await prismaClientInstance.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Expense" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "amount" DECIMAL(65,30) NOT NULL,
          "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "notes" TEXT,
          "paymentMethod" TEXT,
          "createdById" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
        )
      `);
      await prismaClientInstance.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Expense_expenseDate_idx" ON "Expense"("expenseDate")`
      );
      await prismaClientInstance.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category")`
      );
      await prismaClientInstance.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "Expense_createdById_idx" ON "Expense"("createdById")`
      );
      await prismaClientInstance.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Expense_createdById_fkey'
          ) THEN
            ALTER TABLE "Expense"
              ADD CONSTRAINT "Expense_createdById_fkey"
              FOREIGN KEY ("createdById") REFERENCES "User"("id")
              ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `);
    })().catch((err) => {
      expenseSchemaReady = null;
      throw err;
    });
  }
  return expenseSchemaReady;
}

function mapExpense(row: RawExpense): ExpenseRow {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount),
    expenseDate: new Date(row.expenseDate),
    notes: row.notes,
    paymentMethod: row.paymentMethod,
    createdById: row.createdById,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    createdBy:
      row.createdByEmail != null
        ? { name: row.createdByName ?? null, email: row.createdByEmail }
        : null,
  };
}

/** Prefer Prisma delegate when available; fall back to SQL if client is stale. */
function expenseModel() {
  return (prismaClientInstance as { expense?: {
    findMany: Function;
    create: Function;
    update: Function;
    delete: Function;
  } }).expense;
}

export async function listExpenses(params: {
  from?: Date;
  to?: Date;
  category?: string | null;
  take?: number;
}): Promise<ExpenseRow[]> {
  await ensureExpenseSchema();
  const model = expenseModel();
  if (model) {
    const where: Record<string, unknown> = {};
    if (params.from || params.to) {
      where.expenseDate = {
        ...(params.from ? { gte: params.from } : {}),
        ...(params.to ? { lte: params.to } : {}),
      };
    }
    if (params.category) where.category = params.category;
    const rows = await model.findMany({
      where,
      orderBy: { expenseDate: "desc" },
      include: { createdBy: { select: { name: true, email: true } } },
      take: params.take ?? 500,
    });
    return rows.map((e: RawExpense & { createdBy?: { name: string | null; email: string } | null }) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: Number(e.amount),
      expenseDate: new Date(e.expenseDate),
      notes: e.notes,
      paymentMethod: e.paymentMethod,
      createdById: e.createdById,
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      createdBy: e.createdBy ?? null,
    }));
  }

  const take = params.take ?? 500;
  const rows = await prismaClientInstance.$queryRawUnsafe<RawExpense[]>(
    `SELECT e.id, e.title, e.category, e.amount, e."expenseDate", e.notes, e."paymentMethod",
            e."createdById", e."createdAt", e."updatedAt",
            u.name AS "createdByName", u.email AS "createdByEmail"
     FROM "Expense" e
     LEFT JOIN "User" u ON u.id = e."createdById"
     WHERE ($1::timestamptz IS NULL OR e."expenseDate" >= $1)
       AND ($2::timestamptz IS NULL OR e."expenseDate" <= $2)
       AND ($3::text IS NULL OR e.category = $3)
     ORDER BY e."expenseDate" DESC
     LIMIT $4`,
    params.from ?? null,
    params.to ?? null,
    params.category ?? null,
    take
  );
  return rows.map(mapExpense);
}

export async function createExpense(data: {
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  notes: string | null;
  paymentMethod: string | null;
  createdById: string;
}): Promise<ExpenseRow> {
  await ensureExpenseSchema();
  const model = expenseModel();
  if (model) {
    const created = await model.create({ data });
    return {
      ...created,
      amount: Number(created.amount),
      expenseDate: new Date(created.expenseDate),
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    };
  }

  const id = randomUUID();
  const now = new Date();
  await prismaClientInstance.$executeRawUnsafe(
    `INSERT INTO "Expense"
      (id, title, category, amount, "expenseDate", notes, "paymentMethod", "createdById", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    id,
    data.title,
    data.category,
    data.amount,
    data.expenseDate,
    data.notes,
    data.paymentMethod,
    data.createdById,
    now,
    now
  );

  return {
    id,
    title: data.title,
    category: data.category,
    amount: data.amount,
    expenseDate: data.expenseDate,
    notes: data.notes,
    paymentMethod: data.paymentMethod,
    createdById: data.createdById,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateExpense(
  id: string,
  data: Record<string, unknown>
): Promise<ExpenseRow> {
  await ensureExpenseSchema();
  const model = expenseModel();
  if (model) {
    const updated = await model.update({ where: { id }, data });
    return {
      ...updated,
      amount: Number(updated.amount),
      expenseDate: new Date(updated.expenseDate),
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    };
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const [key, value] of Object.entries(data)) {
    const col =
      key === "expenseDate"
        ? `"expenseDate"`
        : key === "paymentMethod"
          ? `"paymentMethod"`
          : key === "createdById"
            ? `"createdById"`
            : key;
    fields.push(`${col} = $${i++}`);
    values.push(value);
  }
  fields.push(`"updatedAt" = $${i++}`);
  values.push(new Date());
  values.push(id);

  await prismaClientInstance.$executeRawUnsafe(
    `UPDATE "Expense" SET ${fields.join(", ")} WHERE id = $${i}`,
    ...values
  );

  const rows = await prismaClientInstance.$queryRawUnsafe<RawExpense[]>(
    `SELECT id, title, category, amount, "expenseDate", notes, "paymentMethod",
            "createdById", "createdAt", "updatedAt"
     FROM "Expense" WHERE id = $1`,
    id
  );
  if (!rows[0]) throw new Error("Expense not found");
  return mapExpense(rows[0]);
}

export async function deleteExpense(id: string): Promise<ExpenseRow> {
  await ensureExpenseSchema();
  const model = expenseModel();
  if (model) {
    const deleted = await model.delete({ where: { id } });
    return {
      ...deleted,
      amount: Number(deleted.amount),
      expenseDate: new Date(deleted.expenseDate),
      createdAt: new Date(deleted.createdAt),
      updatedAt: new Date(deleted.updatedAt),
    };
  }

  const rows = await prismaClientInstance.$queryRawUnsafe<RawExpense[]>(
    `SELECT id, title, category, amount, "expenseDate", notes, "paymentMethod",
            "createdById", "createdAt", "updatedAt"
     FROM "Expense" WHERE id = $1`,
    id
  );
  if (!rows[0]) throw new Error("Expense not found");
  await prismaClientInstance.$executeRawUnsafe(`DELETE FROM "Expense" WHERE id = $1`, id);
  return mapExpense(rows[0]);
}
