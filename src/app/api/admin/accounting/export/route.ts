import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import {
  getAccountingSummary,
  resolvePeriod,
  type PeriodKey,
} from "@/lib/accounting";
import {
  buildAccountingExcel,
  buildAccountingPdf,
  reportContentType,
  reportFilename,
  type ReportFormat,
  type ReportKind,
} from "@/lib/accounting-reports";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const period = (req.nextUrl.searchParams.get("period") || "month") as PeriodKey;
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const type = (req.nextUrl.searchParams.get("type") || "full") as ReportKind;
    const format = (req.nextUrl.searchParams.get("format") || "pdf") as ReportFormat;

    if (!["summary", "daily", "expenses", "full"].includes(type)) {
      return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 });
    }
    if (!["pdf", "xlsx"].includes(format)) {
      return NextResponse.json(
        { success: false, message: "Format must be pdf or xlsx (Excel)" },
        { status: 400 }
      );
    }

    const range = resolvePeriod(period, from, to);
    const summary = await getAccountingSummary(range.from, range.to);

    const reportData = {
      periodLabel: range.label,
      from: range.from,
      to: range.to,
      totals: summary.totals,
      daily: summary.daily,
      expenseBreakdown: summary.expenseBreakdown,
      incomeByPayment: summary.incomeByPayment,
      expenses: summary.recentExpenses,
      orders: summary.reportOrders,
    };

    const body =
      format === "pdf"
        ? await buildAccountingPdf(type, reportData)
        : buildAccountingExcel(type, reportData);

    const filename = reportFilename(type, format, period);

    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": reportContentType(format),
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[accounting/export]", err);
    return NextResponse.json({ success: false, message: "Export failed" }, { status: 500 });
  }
}
