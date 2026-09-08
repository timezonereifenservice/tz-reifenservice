import { countryLabel } from "@/lib/analytics/client-context";
import {
  CTA_LABELS,
  formKeyLabel,
  TZ_SERVICES,
} from "@/lib/analytics/constants";
import { matchesServicePath, normalizePath, pageLabel } from "@/lib/analytics/paths";
import { getEmptyAnalyticsSnapshot } from "@/lib/analytics/empty-analytics";
import { listAnalyticsEventsSince } from "@/lib/analytics/storage";
import type {
  AnalyticsPeriod,
  BreakdownRow,
  WebsiteAnalyticsSnapshot,
} from "@/lib/analytics/types";
import { listLeads } from "@/lib/leads/storage";
import type { LeadListItem } from "@/lib/leads/types";

function periodDays(period: AnalyticsPeriod) {
  return period === "7d" ? 7 : 30;
}

function sinceIso(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

function pctChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function filterLeadsByPeriod(leads: LeadListItem[], since: string) {
  const sinceMs = new Date(since).getTime();
  return leads.filter((lead) => new Date(lead.createdAt).getTime() >= sinceMs);
}

function countUniqueVisitors(
  events: Array<{ eventType: string; visitorId?: string; sessionId?: string; id: string }>,
) {
  const ids = new Set<string>();
  for (const event of events) {
    if (event.eventType !== "page_view") continue;
    const id = event.visitorId || event.sessionId;
    if (id) ids.add(id);
  }
  return ids.size;
}

function buildBreakdown(
  events: Array<{
    eventType: string;
    visitorId?: string;
    sessionId?: string;
    id: string;
    country?: string;
    device?: string;
    browser?: string;
  }>,
  field: "country" | "device" | "browser",
  labelFor: (key: string) => string,
): BreakdownRow[] {
  const buckets = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.eventType !== "page_view") continue;
    const raw = (event[field] || "").trim();
    const key = raw || "unknown";
    const id = event.visitorId || event.sessionId || event.id;
    const set = buckets.get(key) ?? new Set<string>();
    set.add(id);
    buckets.set(key, set);
  }

  const total = [...buckets.values()].reduce((sum, set) => sum + set.size, 0);
  return [...buckets.entries()]
    .map(([key, set]) => ({
      key,
      label: key === "unknown" ? "Unbekannt" : labelFor(key),
      visitors: set.size,
      sharePct: total ? Math.round((set.size / total) * 100) : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);
}

export async function getAnalyticsSnapshot(
  period: AnalyticsPeriod,
): Promise<WebsiteAnalyticsSnapshot> {
  const days = periodDays(period);
  const currentSince = sinceIso(days);
  const previousSince = sinceIso(days * 2);

  const [events, allLeads] = await Promise.all([
    listAnalyticsEventsSince(previousSince),
    listLeads(),
  ]);

  if (events.length === 0 && allLeads.length === 0) {
    return getEmptyAnalyticsSnapshot(period);
  }

  const currentEvents = events.filter((e) => e.createdAt >= currentSince);
  const previousEvents = events.filter(
    (e) => e.createdAt >= previousSince && e.createdAt < currentSince,
  );

  const currentLeads = filterLeadsByPeriod(allLeads, currentSince);
  const previousLeads = filterLeadsByPeriod(allLeads, previousSince).filter(
    (lead) => lead.createdAt < currentSince,
  );

  const visitors = countUniqueVisitors(currentEvents);
  const previousVisitors = countUniqueVisitors(previousEvents);
  const leadsCount = currentLeads.length;
  const previousLeadsCount = previousLeads.length;

  const consentEvents = currentEvents.filter((e) => e.eventType === "consent");
  const accepted = consentEvents.filter((e) => e.consentValue === "accepted").length;
  const consentRate =
    consentEvents.length > 0
      ? Math.round((accepted / consentEvents.length) * 100)
      : 0;

  const pageViews = currentEvents.filter((e) => e.eventType === "page_view");
  const pathViews = new Map<string, number>();
  for (const evt of pageViews) {
    const path = normalizePath(evt.path);
    pathViews.set(path, (pathViews.get(path) ?? 0) + 1);
  }

  const topPages = [...pathViews.entries()]
    .map(([path, views]) => ({
      path,
      label: pageLabel(path),
      views,
      engagementRate: 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const ctaCounts = new Map<string, number>();
  for (const evt of currentEvents.filter((e) => e.eventType === "cta_click")) {
    const id = evt.ctaId || "unknown";
    ctaCounts.set(id, (ctaCounts.get(id) ?? 0) + 1);
  }

  const leadSources = new Map<string, number>();
  for (const lead of currentLeads) {
    leadSources.set(lead.formKey, (leadSources.get(lead.formKey) ?? 0) + 1);
  }
  const leadSourceRows = [...leadSources.entries()]
    .map(([formKey, count]) => ({
      formKey,
      label: formKeyLabel(formKey),
      leads: count,
      sharePct: leadsCount
        ? Math.round((count / leadsCount) * 100)
        : 0,
    }))
    .sort((a, b) => b.leads - a.leads);

  const services = TZ_SERVICES.map((service) => {
    const views = pageViews.filter((e) =>
      matchesServicePath(e.path, service.path),
    ).length;
    const leads = currentLeads.filter((l) =>
      matchesServicePath(l.sourcePage, service.path),
    ).length;
    return { ...service, views, leads };
  }).sort((a, b) => b.views - a.views);

  const ctas = [...ctaCounts.entries()]
    .map(([id, clicks]) => ({
      id,
      label: CTA_LABELS[id] ?? id,
      clicks,
      conversions: 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    period,
    kpis: {
      visitors,
      leads: leadsCount,
      conversionRate:
        visitors > 0 ? Number(((leadsCount / visitors) * 100).toFixed(2)) : 0,
      consentRate,
      visitorsChangePct: pctChange(visitors, previousVisitors),
      leadsChangePct: pctChange(leadsCount, previousLeadsCount),
    },
    countries: buildBreakdown(currentEvents, "country", (k) => countryLabel(k)),
    devices: buildBreakdown(currentEvents, "device", (k) => k),
    browsers: buildBreakdown(currentEvents, "browser", (k) => k),
    leadSources: leadSourceRows,
    services,
    ctas,
    topPages,
  };
}
