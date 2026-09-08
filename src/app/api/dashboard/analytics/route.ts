import { NextResponse } from "next/server";
import { getAnalyticsSnapshot } from "@/lib/analytics/snapshot";
import type { AnalyticsPeriod } from "@/lib/analytics/types";
import { requireDashboardUser } from "@/lib/dashboard-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePeriod(value: string | null): AnalyticsPeriod {
  return value === "7d" ? "7d" : "30d";
}

export async function GET(request: Request) {
  const auth = await requireDashboardUser();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams.get("period"));

  try {
    const snapshot = await getAnalyticsSnapshot(period);
    const hasData =
      snapshot.kpis.visitors > 0 ||
      snapshot.kpis.leads > 0 ||
      snapshot.leadSources.length > 0;

    return NextResponse.json({
      ok: true,
      source: hasData ? "live" : "empty",
      snapshot,
    });
  } catch (error) {
    console.error("[api/dashboard/analytics]", error);
    return NextResponse.json(
      { ok: false, error: "Analytics konnten nicht geladen werden." },
      { status: 500 },
    );
  }
}
