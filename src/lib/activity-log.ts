import { prismaClientInstance } from "@/lib/prismaDB";
import type { Prisma } from "@prisma/client";

export type ActivityModule =
  | "PRODUCT"
  | "CATEGORY"
  | "INVENTORY"
  | "ORDER"
  | "USER"
  | "AUTH"
  | "SETTINGS"
  | "PAYMENT"
  | "REVIEW"
  | "COUPON";

export interface LogActivityParams {
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: string;
  module: ActivityModule;
  entityId?: string | null;
  entityName?: string | null;
  description?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logActivity(params: LogActivityParams) {
  try {
    await prismaClientInstance.activityLog.create({
      data: {
        userId: params.userId ?? null,
        userName: params.userName ?? null,
        userRole: params.userRole ?? null,
        action: params.action,
        module: params.module,
        entityId: params.entityId ?? null,
        entityName: params.entityName ?? null,
        description: params.description ?? null,
        oldValue: (params.oldValue ?? undefined) as Prisma.InputJsonValue | undefined,
        newValue: (params.newValue ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

export function getRequestMeta(req: Request) {
  return {
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null,
    userAgent: req.headers.get("user-agent") || null,
  };
}

export function buildChangeDescription(
  field: string,
  oldVal: unknown,
  newVal: unknown
): string {
  return `${field}: ${String(oldVal)} → ${String(newVal)}`;
}
