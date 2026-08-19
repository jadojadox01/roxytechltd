export const DEFAULT_WHATSAPP_PHONE = "0783428632";

export function toWhatsAppDigits(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `250${digits.slice(1)}`;
  }
  return digits;
}

export function toWhatsAppUrl(raw: string, message?: string) {
  const digits = toWhatsAppDigits(raw);
  if (!digits) return "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}
