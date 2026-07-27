import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export type AppRole = "USER" | "ADMIN" | "STORE_KEEPER";

const ROLE_HIERARCHY: Record<AppRole, number> = {
  USER: 0,
  STORE_KEEPER: 1,
  ADMIN: 2,
};

export const PERMISSIONS = {
  // Products
  PRODUCT_VIEW: "product:view",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  // Categories
  CATEGORY_VIEW: "category:view",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",
  // Inventory
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_MANAGE: "inventory:manage",
  // Orders
  ORDER_VIEW: "order:view",
  ORDER_UPDATE: "order:update",
  // Users
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  // Reports & Activity
  REPORTS_VIEW: "reports:view",
  ACTIVITY_VIEW: "activity:view",
  // Settings
  SETTINGS_VIEW: "settings:view",
  SETTINGS_UPDATE: "settings:update",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  USER: [],
  STORE_KEEPER: [
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
  ],
  ADMIN: Object.values(PERMISSIONS),
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const appRole = role as AppRole;
  if (appRole === "ADMIN") return true;
  return ROLE_PERMISSIONS[appRole]?.includes(permission) ?? false;
}

export function hasAnyRole(role: string | null | undefined, roles: AppRole[]): boolean {
  if (!role) return false;
  return roles.includes(role as AppRole);
}

export function isStaff(role: string | null | undefined): boolean {
  return hasAnyRole(role, ["ADMIN", "STORE_KEEPER"]);
}

export function canManageProducts(role: string | null | undefined): boolean {
  return hasAnyRole(role, ["ADMIN", "STORE_KEEPER"]);
}

export function canManageInventory(role: string | null | undefined): boolean {
  return hasAnyRole(role, ["ADMIN", "STORE_KEEPER"]);
}

export function canManageOrders(role: string | null | undefined): boolean {
  return hasAnyRole(role, ["ADMIN", "STORE_KEEPER"]);
}

export function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

export function roleLevel(role: string | null | undefined): number {
  if (!role) return -1;
  return ROLE_HIERARCHY[role as AppRole] ?? -1;
}

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireRole(roles: AppRole[]) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (!hasAnyRole(session!.user.role, roles)) {
    return { session: null, error: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requirePermission(permission: Permission) {
  const { session, error } = await requireAuth();
  if (error) return { session: null, error };
  if (!hasPermission(session!.user.role, permission)) {
    return { session: null, error: NextResponse.json({ error: "Access denied" }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function requireStaff() {
  return requireRole(["ADMIN", "STORE_KEEPER"]);
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}
