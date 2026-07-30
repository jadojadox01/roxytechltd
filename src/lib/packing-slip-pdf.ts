import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PackingItem = {
  productTitle: string;
  quantity: number;
  sku?: string | null;
};

export type PackingOrder = {
  id: string;
  createdAt: Date | string;
  status: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  items: PackingItem[];
};

function pdfSafe(text: string) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, 100);
}

export async function buildPackingSlipPdf(
  order: PackingOrder,
  storeName = "ROXIN STORE"
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
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
  write("PACKING SLIP", 14, true);
  y -= 4;
  write(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`);
  write(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  write(`Status: ${order.status.replace(/_/g, " ")}`);
  y -= 8;
  write("Ship To", 12, true);
  write(order.shippingName);
  write(order.shippingPhone);
  write(order.shippingAddress);
  y -= 10;
  write("Items to pack", 12, true);
  write("Qty   Product", 10, true);

  for (const item of order.items) {
    if (y < 80) break;
    write(`${String(item.quantity).padStart(3, " ")}    ${item.productTitle}`);
  }

  y -= 16;
  write("Packed by: ____________________   Date: ____________", 10);
  y -= 8;
  write("Checked by: ___________________   Notes: ___________", 10);

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
