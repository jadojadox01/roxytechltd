import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ReceiptItem = {
  productTitle: string;
  quantity: number;
  price: number;
};

export type ReceiptOrder = {
  id: string;
  createdAt: Date | string;
  status: string;
  paymentMethod: string;
  totalPrice: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  items: ReceiptItem[];
};

function money(value: number) {
  return `${Number(value || 0).toLocaleString("en-RW")} RWF`;
}

/** Helvetica (WinAnsi) can't encode all Unicode — sanitize for PDF drawText. */
function pdfSafe(text: string) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, 90);
}

export async function buildOrderReceiptPdf(
  order: ReceiptOrder,
  storeName = "NAALVA STORE"
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const left = 50;

  const write = (text: string, size = 11, isBold = false) => {
    page.drawText(pdfSafe(text), {
      x: left,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0.1, 0.12, 0.16),
    });
    y -= size + 8;
  };

  write(storeName, 18, true);
  write("Order Receipt", 14, true);
  y -= 6;
  write(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`);
  write(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  write(`Status: ${order.status.replace(/_/g, " ")}`);
  write(`Payment: ${order.paymentMethod}`);
  y -= 8;
  write("Customer", 12, true);
  write(order.shippingName);
  write(order.shippingEmail);
  write(order.shippingPhone);
  write(order.shippingAddress);
  y -= 10;
  write("Items", 12, true);

  for (const item of order.items) {
    if (y < 80) break;
    write(
      `${item.productTitle}  x${item.quantity}   ${money(item.price)}`
    );
  }

  y -= 8;
  write(`Total: ${money(order.totalPrice)}`, 13, true);
  y -= 16;
  write("Thank you for shopping with us.", 10);
  write("This receipt confirms your order with NAALVA STORE.", 10);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
