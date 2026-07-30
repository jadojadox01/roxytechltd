import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type AccountingReportData = {
  periodLabel: string;
  from: Date;
  to: Date;
  totals: {
    income: number;
    expenses: number;
    profit: number;
    orderCount: number;
    unitsSold: number;
    expenseCount: number;
    marginPercent: number;
  };
  daily: Array<{ date: string; income: number; expenses: number; profit: number }>;
  expenseBreakdown: Array<{ category: string; amount: number }>;
  incomeByPayment: Array<{ method: string; amount: number }>;
  expenses: Array<{
    expenseDate: Date | string;
    title: string;
    category: string;
    amount: number;
    paymentMethod: string | null;
    notes: string | null;
  }>;
  orders: Array<{
    id: string;
    shippingName: string;
    paymentMethod: string;
    createdAt: Date | string;
    totalPrice: number;
  }>;
};

export type ReportKind = "summary" | "daily" | "expenses" | "full";
export type ReportFormat = "pdf" | "xlsx";

function money(n: number) {
  return Number(n || 0).toLocaleString("en-RW", { maximumFractionDigits: 0 });
}

function pdfSafe(text: string) {
  return String(text || "")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .slice(0, 110);
}

function xmlEscape(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sheetRows(kind: ReportKind, data: AccountingReportData): string[][] {
  const header = [
    ["ROXIN.RW Accounting Report"],
    ["Period", data.periodLabel],
    ["From", data.from.toISOString().slice(0, 10)],
    ["To", data.to.toISOString().slice(0, 10)],
    ["Generated", new Date().toISOString()],
    [],
  ];

  if (kind === "daily") {
    return [
      ...header,
      ["Date", "Income (RWF)", "Expenses (RWF)", "Profit (RWF)"],
      ...data.daily.map((d) => [
        d.date,
        String(d.income),
        String(d.expenses),
        String(d.profit),
      ]),
    ];
  }

  if (kind === "expenses") {
    return [
      ...header,
      ["Date", "Title", "Category", "Amount (RWF)", "Payment Method", "Notes"],
      ...data.expenses.map((e) => [
        new Date(e.expenseDate).toISOString().slice(0, 10),
        e.title,
        e.category,
        String(e.amount),
        e.paymentMethod || "",
        e.notes || "",
      ]),
    ];
  }

  const summaryBlock = [
    ...header,
    ["Metric", "Value"],
    ["Income (RWF)", String(data.totals.income)],
    ["Expenses (RWF)", String(data.totals.expenses)],
    ["Net profit (RWF)", String(data.totals.profit)],
    ["Profit margin %", data.totals.marginPercent.toFixed(2)],
    ["Completed orders", String(data.totals.orderCount)],
    ["Units sold", String(data.totals.unitsSold)],
    ["Expense records", String(data.totals.expenseCount)],
    [],
    ["Expense category", "Amount (RWF)"],
    ...data.expenseBreakdown.map((c) => [c.category, String(c.amount)]),
    [],
    ["Payment method", "Income (RWF)"],
    ...data.incomeByPayment.map((p) => [p.method, String(p.amount)]),
  ];

  if (kind === "summary") return summaryBlock;

  return [
    ...summaryBlock,
    [],
    ["Daily cash flow"],
    ["Date", "Income (RWF)", "Expenses (RWF)", "Profit (RWF)"],
    ...data.daily.map((d) => [
      d.date,
      String(d.income),
      String(d.expenses),
      String(d.profit),
    ]),
    [],
    ["Expenses detail"],
    ["Date", "Title", "Category", "Amount (RWF)", "Payment Method", "Notes"],
    ...data.expenses.map((e) => [
      new Date(e.expenseDate).toISOString().slice(0, 10),
      e.title,
      e.category,
      String(e.amount),
      e.paymentMethod || "",
      e.notes || "",
    ]),
    [],
    ["Recent income (completed orders)"],
    ["Order", "Customer", "Payment", "Date", "Amount (RWF)"],
    ...data.orders.map((o) => [
      o.id.slice(0, 8),
      o.shippingName,
      String(o.paymentMethod || "").split("|")[0],
      new Date(o.createdAt).toISOString().slice(0, 19).replace("T", " "),
      String(o.totalPrice),
    ]),
  ];
}

/** Excel-compatible SpreadsheetML (.xls) — opens in Excel / Google Sheets. */
export function buildAccountingExcel(
  kind: ReportKind,
  data: AccountingReportData
): Buffer {
  const rows = sheetRows(kind, data);
  const table = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => {
            const value = String(cell ?? "");
            const isNum = value !== "" && /^-?\d+(\.\d+)?$/.test(value);
            if (isNum) {
              return `<Cell><Data ss:Type="Number">${xmlEscape(value)}</Data></Cell>`;
            }
            return `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
          })
          .join("")}</Row>`
    )
    .join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Accounting">
  <Table>${table}</Table>
 </Worksheet>
</Workbook>`;

  return Buffer.from(xml, "utf8");
}

export async function buildAccountingPdf(
  kind: ReportKind,
  data: AccountingReportData
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 42;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const BOTTOM = 52;

  const navy = rgb(0.11, 0.18, 0.64);
  const ink = rgb(0.12, 0.14, 0.18);
  const muted = rgb(0.42, 0.46, 0.52);
  const line = rgb(0.86, 0.88, 0.92);
  const headerBg = rgb(0.93, 0.95, 0.99);
  const altRow = rgb(0.97, 0.98, 0.99);
  const softOrange = rgb(1, 0.95, 0.9);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  let pageNo = 1;

  const drawFooter = () => {
    page.drawLine({
      start: { x: MARGIN, y: 36 },
      end: { x: PAGE_W - MARGIN, y: 36 },
      thickness: 0.5,
      color: line,
    });
    page.drawText(pdfSafe("ROXIN.RW Accounting"), {
      x: MARGIN,
      y: 22,
      size: 8,
      font,
      color: muted,
    });
    page.drawText(pdfSafe(`Page ${pageNo}`), {
      x: PAGE_W - MARGIN - 40,
      y: 22,
      size: 8,
      font,
      color: muted,
    });
  };

  const newPage = () => {
    drawFooter();
    page = pdf.addPage([PAGE_W, PAGE_H]);
    pageNo += 1;
    y = PAGE_H - MARGIN;
  };

  const ensureSpace = (need: number) => {
    if (y - need < BOTTOM) newPage();
  };

  const textWidth = (text: string, size: number, useBold = false) =>
    (useBold ? bold : font).widthOfTextAtSize(pdfSafe(text), size);

  const drawTextAt = (
    text: string,
    x: number,
    baseline: number,
    size: number,
    opts?: { bold?: boolean; color?: ReturnType<typeof rgb>; align?: "left" | "right" }
  ) => {
    const safe = pdfSafe(text);
    const useBold = !!opts?.bold;
    const color = opts?.color ?? ink;
    const w = textWidth(safe, size, useBold);
    const drawX = opts?.align === "right" ? x - w : x;
    page.drawText(safe, {
      x: drawX,
      y: baseline,
      size,
      font: useBold ? bold : font,
      color,
    });
  };

  const sectionTitle = (title: string) => {
    ensureSpace(36);
    y -= 10;
    drawTextAt(title, MARGIN, y, 12, { bold: true, color: navy });
    y -= 6;
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 1.25,
      color: navy,
    });
    y -= 14;
  };

  type Col = {
    key: string;
    width: number;
    align?: "left" | "right";
  };

  const drawTable = (
    columns: Col[],
    rows: string[][],
    emptyMessage = "No data for this section."
  ) => {
    const rowH = 18;
    const headerH = 22;

    ensureSpace(headerH + rowH + 8);

    // Header bar
    page.drawRectangle({
      x: MARGIN,
      y: y - headerH + 4,
      width: CONTENT_W,
      height: headerH,
      color: headerBg,
    });

    let x = MARGIN + 8;
    for (const col of columns) {
      const labelX = col.align === "right" ? x + col.width - 8 : x;
      drawTextAt(col.key, labelX, y - 10, 8, {
        bold: true,
        color: muted,
        align: col.align === "right" ? "right" : "left",
      });
      x += col.width;
    }
    y -= headerH;

    if (!rows.length) {
      ensureSpace(28);
      drawTextAt(emptyMessage, MARGIN + 8, y - 4, 9, { color: muted });
      y -= 24;
      return;
    }

    rows.forEach((row, idx) => {
      ensureSpace(rowH + 4);
      if (idx % 2 === 1) {
        page.drawRectangle({
          x: MARGIN,
          y: y - rowH + 5,
          width: CONTENT_W,
          height: rowH,
          color: altRow,
        });
      }

      let cx = MARGIN + 8;
      row.forEach((cell, i) => {
        const col = columns[i];
        const maxChars = Math.max(4, Math.floor(col.width / 5.2));
        const labelX = col.align === "right" ? cx + col.width - 8 : cx;
        drawTextAt(String(cell).slice(0, maxChars), labelX, y - 8, 9, {
          align: col.align === "right" ? "right" : "left",
        });
        cx += col.width;
      });

      page.drawLine({
        start: { x: MARGIN, y: y - rowH + 5 },
        end: { x: PAGE_W - MARGIN, y: y - rowH + 5 },
        thickness: 0.4,
        color: line,
      });
      y -= rowH;
    });

    y -= 8;
  };

  // ── Header ──────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 78,
    width: PAGE_W,
    height: 78,
    color: navy,
  });
  drawTextAt("ROXIN.RW", MARGIN, PAGE_H - 38, 18, {
    bold: true,
    color: rgb(1, 1, 1),
  });
  drawTextAt("Accounting Report", MARGIN, PAGE_H - 58, 11, {
    color: rgb(0.85, 0.88, 1),
  });
  drawTextAt(data.periodLabel, PAGE_W - MARGIN, PAGE_H - 38, 11, {
    bold: true,
    color: rgb(1, 1, 1),
    align: "right",
  });
  drawTextAt(
    `${data.from.toISOString().slice(0, 10)}  to  ${data.to.toISOString().slice(0, 10)}`,
    PAGE_W - MARGIN,
    PAGE_H - 56,
    9,
    { color: rgb(0.8, 0.84, 1), align: "right" }
  );
  y = PAGE_H - 98;
  drawTextAt(`Generated ${new Date().toLocaleString()}`, MARGIN, y, 8, {
    color: muted,
  });
  y -= 18;

  // ── KPI summary cards ───────────────────────────────────────────────────
  if (kind === "summary" || kind === "full") {
    sectionTitle("1. Financial overview");

    const cards = [
      { label: "Income", value: `RWF ${money(data.totals.income)}` },
      { label: "Expenses", value: `RWF ${money(data.totals.expenses)}` },
      { label: "Net profit", value: `RWF ${money(data.totals.profit)}` },
      { label: "Margin", value: `${data.totals.marginPercent.toFixed(1)}%` },
    ];
    const gap = 10;
    const cardW = (CONTENT_W - gap * 3) / 4;
    const cardH = 48;
    ensureSpace(cardH + 20);

    cards.forEach((card, i) => {
      const cx = MARGIN + i * (cardW + gap);
      page.drawRectangle({
        x: cx,
        y: y - cardH,
        width: cardW,
        height: cardH,
        color: i === 2 ? softOrange : headerBg,
        borderColor: line,
        borderWidth: 0.8,
      });
      drawTextAt(card.label.toUpperCase(), cx + 8, y - 16, 7, {
        bold: true,
        color: muted,
      });
      drawTextAt(card.value, cx + 8, y - 36, 10, { bold: true, color: navy });
    });
    y -= cardH + 16;

    drawTable(
      [
        { key: "Metric", width: CONTENT_W * 0.55 },
        { key: "Value", width: CONTENT_W * 0.45, align: "right" },
      ],
      [
        ["Completed orders", String(data.totals.orderCount)],
        ["Units sold", String(data.totals.unitsSold)],
        ["Expense records", String(data.totals.expenseCount)],
      ]
    );

    sectionTitle("2. Expenses by category");
    drawTable(
      [
        { key: "Category", width: CONTENT_W * 0.65 },
        { key: "Amount (RWF)", width: CONTENT_W * 0.35, align: "right" },
      ],
      data.expenseBreakdown.map((r) => [r.category, money(r.amount)]),
      "No expenses recorded in this period."
    );

    sectionTitle("3. Income by payment method");
    drawTable(
      [
        { key: "Payment method", width: CONTENT_W * 0.65 },
        { key: "Amount (RWF)", width: CONTENT_W * 0.35, align: "right" },
      ],
      data.incomeByPayment.map((r) => [
        String(r.method || "unknown").toUpperCase(),
        money(r.amount),
      ]),
      "No completed-order income in this period."
    );
  }

  if (kind === "daily" || kind === "full") {
    sectionTitle(kind === "full" ? "4. Daily cash flow" : "1. Daily cash flow");
    drawTable(
      [
        { key: "Date", width: CONTENT_W * 0.28 },
        { key: "Income (RWF)", width: CONTENT_W * 0.24, align: "right" },
        { key: "Expenses (RWF)", width: CONTENT_W * 0.24, align: "right" },
        { key: "Profit (RWF)", width: CONTENT_W * 0.24, align: "right" },
      ],
      data.daily.map((r) => [
        r.date,
        money(r.income),
        money(r.expenses),
        money(r.profit),
      ]),
      "No daily activity in this period."
    );
  }

  if (kind === "expenses" || kind === "full") {
    sectionTitle(
      kind === "full" ? "5. Expense details" : "1. Expense details"
    );
    drawTable(
      [
        { key: "Date", width: CONTENT_W * 0.16 },
        { key: "Title", width: CONTENT_W * 0.34 },
        { key: "Category", width: CONTENT_W * 0.28 },
        { key: "Amount (RWF)", width: CONTENT_W * 0.22, align: "right" },
      ],
      data.expenses.map((r) => [
        new Date(r.expenseDate).toISOString().slice(0, 10),
        r.title,
        r.category,
        money(r.amount),
      ]),
      "No expenses recorded in this period."
    );
  }

  if (kind === "full") {
    sectionTitle("6. Recent completed-order income");
    drawTable(
      [
        { key: "Order", width: CONTENT_W * 0.14 },
        { key: "Customer", width: CONTENT_W * 0.36 },
        { key: "Payment", width: CONTENT_W * 0.24 },
        { key: "Amount (RWF)", width: CONTENT_W * 0.26, align: "right" },
      ],
      data.orders.map((r) => [
        `#${r.id.slice(0, 8)}`,
        r.shippingName,
        String(r.paymentMethod || "").split("|")[0].toUpperCase(),
        money(r.totalPrice),
      ]),
      "No completed orders in this period."
    );
  }

  drawFooter();
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

export function reportFilename(kind: ReportKind, format: ReportFormat, period: string) {
  const ext = format === "pdf" ? "pdf" : "xls";
  return `accounting-${kind}-${period}.${ext}`;
}

export function reportContentType(format: ReportFormat) {
  return format === "pdf"
    ? "application/pdf"
    : "application/vnd.ms-excel";
}
