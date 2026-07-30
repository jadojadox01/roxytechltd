import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/rbac";
import {
  getAccountingSummary,
  resolvePeriod,
  type PeriodKey,
} from "@/lib/accounting";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const period = (req.nextUrl.searchParams.get("period") || "month") as PeriodKey;
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const range = resolvePeriod(period, from, to);
    const summary = await getAccountingSummary(range.from, range.to);

    return NextResponse.json(
      {
        success: true,
        period: range.label,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        ...summary,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("[accounting/summary]", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Failed to load accounting summary",
      },
      { status: 500 }
    );
  }
}
