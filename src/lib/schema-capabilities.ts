import { prisma } from "@/lib/prismaDB";

let orderStatusesCache: string[] | null = null;
let productHasStatusCache: boolean | null = null;

export async function getOrderStatuses(): Promise<string[]> {
  if (orderStatusesCache) return orderStatusesCache;
  try {
    const rows = await prisma.$queryRaw<{ status: string }[]>`
      SELECT unnest(enum_range(NULL::"OrderStatus"))::text AS status
    `;
    orderStatusesCache = rows.map((r: { status: string }) => r.status);
  } catch {
    orderStatusesCache = ["PENDING", "APPROVED", "REJECTED"];
  }
  return orderStatusesCache ?? ["PENDING", "APPROVED", "REJECTED"];
}

export function pickStatuses(available: string[], preferred: string[]): string[] {
  const picked = preferred.filter((s) => available.includes(s));
  return picked.length > 0 ? picked : available.filter((s) => s !== "REJECTED" && s !== "COMPLETED");
}

export async function getInProgressOrderStatuses(): Promise<string[]> {
  const available = await getOrderStatuses();
  return pickStatuses(available, ["CONFIRMED", "PREPARING", "APPROVED"]);
}

export async function getActiveOrderStatuses(): Promise<string[]> {
  const available = await getOrderStatuses();
  return pickStatuses(available, [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_DELIVERY",
    "APPROVED",
  ]);
}

export async function productHasStatusColumn(): Promise<boolean> {
  if (productHasStatusCache !== null) return productHasStatusCache;
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Product' AND column_name = 'status'
      ) AS exists
    `;
    productHasStatusCache = Boolean(rows[0]?.exists);
  } catch {
    productHasStatusCache = false;
  }
  return productHasStatusCache;
}

export async function activeProductWhere(): Promise<Record<string, unknown>> {
  const hasStatus = await productHasStatusColumn();
  // Hide only deliberately inactive products. OUT_OF_STOCK is internal —
  // customers can still browse and order those items.
  if (hasStatus) return { status: { not: "INACTIVE" } };
  return {};
}

export async function hasActivityLogTable(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'ActivityLog'
      ) AS exists
    `;
    return Boolean(rows[0]?.exists);
  } catch {
    return false;
  }
}

export async function normalizeOrderStatusForWrite(status: string): Promise<string | null> {
  const available = await getOrderStatuses();
  if (available.includes(status)) return status;

  const legacyMap: Record<string, string> = {
    CONFIRMED: "APPROVED",
    PREPARING: "APPROVED",
    READY_FOR_DELIVERY: "APPROVED",
    COMPLETED: "APPROVED",
  };

  const mapped = legacyMap[status];
  if (mapped && available.includes(mapped)) return mapped;
  return null;
}
