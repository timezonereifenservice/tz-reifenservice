import { NextResponse } from "next/server";
import { getMockAnalyticsSnapshot } from "@/lib/analytics/mock-analytics";
import {
  countUniqueVisitors,
  listAnalyticsEventsSince,
} from "@/lib/analytics/storage";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import type { AnalyticsPeriod } from "@/lib/analytics/types";
import { listLeads } from "@/lib/leads/storage";
import { getDashboardUser } from "@/lib/dashboard-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parsePeriod(value: string | null): AnalyticsPeriod {
  return value === "7d" ? "7d" : "30d";
}

export async function GET(request: Request) {
  const user = await getDashboardUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams.get("period"));
  const days = period === "7d" ? 7 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const sinceIso = since.toISOString();

  try {
    const [events, leads, liveVisitors] = await Promise.all([
      listAnalyticsEventsSince(sinceIso),
      listLeads(),
      countUniqueVisitors(since),
    ]);

    const hasLiveData =
      isSupabaseConfigured() && (events.length > 0 || leads.length > 0);

    if (!hasLiveData) {
      return NextResponse.json({
        ok: true,
        source: "mock",
        snapshot: getMockAnalyticsSnapshot(period),
      });
    }

    const pageViews = events.filter((e) => e.eventType === "page_view").length;
    const leadCount = leads.filter((l) => new Date(l.createdAt) >= since).length;
    const conversionRate =
      liveVisitors > 0 ? Number(((leadCount / liveVisitors) * 100).toFixed(2)) : 0;

    const mock = getMockAnalyticsSnapshot(period);
    const snapshot = {
      ...mock,
      period,
      kpis: {
        ...mock.kpis,
        visitors: liveVisitors || pageViews,
        leads: leadCount,
        conversionRate,
      },
    };

    return NextResponse.json({ ok: true, source: "live", snapshot });
  } catch (error) {
    console.error("[api/dashboard/analytics]", error);
    return NextResponse.json({
      ok: true,
      source: "mock",
      snapshot: getMockAnalyticsSnapshot(period),
    });
  }
}
