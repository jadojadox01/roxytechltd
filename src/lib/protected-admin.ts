export const SUPER_ADMIN_EMAIL = "xjado.jeanne@gmail.com";
export const ORDER_NOTIFY_EMAIL = "roxinrw@gmail.com";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isProtectedSuperAdmin(email?: string | null) {
  if (!email) return false;
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}
