import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { AnalyticsEvent, AnalyticsEventType } from "./types";

export type AnalyticsEventRow = {
  id: string;
  created_at: string;
  event_type: string;
  path: string;
  referrer: string;
  cta_id: string;
  consent_value: string;
  session_id: string;
  visitor_id: string;
  country: string;
  device: string;
  browser: string;
  source: string;
  meta: Record<string, unknown> | null;
};

function cleanPath(path: string) {
  const trimmed = path.trim() || "/";
  try {
    if (trimmed.startsWith("http")) {
      return new URL(trimmed).pathname || "/";
    }
  } catch {
    // keep trimmed
  }
  const noHash = trimmed.split("#")[0] ?? trimmed;
  const noQuery = noHash.split("?")[0] ?? noHash;
  const normalized = noQuery.replace(/\/+/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function cleanTag(value: string | undefined, max = 40) {
  return (value || "").trim().slice(0, max);
}

function mapRow(row: AnalyticsEventRow): AnalyticsEvent {
  return {
    id: row.id,
    createdAt: row.created_at,
    eventType: row.event_type as AnalyticsEventType,
    path: row.path,
    referrer: row.referrer,
    ctaId: row.cta_id,
    consentValue:
      row.consent_value === "accepted" || row.consent_value === "rejected"
        ? row.consent_value
        : undefined,
    sessionId: row.session_id,
    visitorId: row.visitor_id,
    country: row.country,
    device: row.device,
    browser: row.browser,
    meta: row.meta ?? {},
    source: row.source === "dashboard" ? "dashboard" : "wordpress",
  };
}

const memoryEvents: AnalyticsEvent[] = [];

export async function insertAnalyticsEvent(input: {
  eventType: AnalyticsEventType;
  path: string;
  referrer?: string;
  ctaId?: string;
  consentValue?: "accepted" | "rejected";
  sessionId?: string;
  visitorId?: string;
  country?: string;
  device?: string;
  browser?: string;
  meta?: Record<string, unknown>;
  source?: "wordpress" | "dashboard";
}) {
  if (!isSupabaseConfigured()) {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      eventType: input.eventType,
      path: input.path,
      referrer: input.referrer,
      ctaId: input.ctaId,
      consentValue: input.consentValue,
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      country: input.country,
      device: input.device,
      browser: input.browser,
      meta: input.meta ?? {},
      source: input.source ?? "wordpress",
    };
    memoryEvents.push(event);
    return event;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .insert({
      event_type: input.eventType,
      path: cleanPath(input.path || "/"),
      referrer: (input.referrer || "").slice(0, 500),
      cta_id: (input.ctaId || "").slice(0, 120),
      consent_value: input.consentValue || "",
      session_id: (input.sessionId || "").slice(0, 120),
      visitor_id: (input.visitorId || "").slice(0, 120),
      country: cleanTag(input.country, 8).toUpperCase(),
      device: cleanTag(input.device),
      browser: cleanTag(input.browser),
      source: input.source ?? "wordpress",
      meta: input.meta ?? {},
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id as string,
    createdAt: new Date().toISOString(),
    eventType: input.eventType,
    path: input.path,
    source: input.source ?? "wordpress",
  } as AnalyticsEvent;
}

export async function listAnalyticsEventsSince(
  sinceIso: string,
): Promise<AnalyticsEvent[]> {
  if (!isSupabaseConfigured()) {
    return memoryEvents.filter((e) => e.createdAt >= sinceIso);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("analytics_events")
    .select(
      "id, created_at, event_type, path, referrer, cta_id, consent_value, session_id, visitor_id, country, device, browser, source, meta",
    )
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapRow(row as AnalyticsEventRow));
}

export async function countUniqueVisitors(since: Date): Promise<number> {
  const sinceIso = since.toISOString();
  const events = await listAnalyticsEventsSince(sinceIso);
  const visitors = new Set<string>();
  for (const evt of events) {
    if (evt.eventType !== "page_view") continue;
    if (evt.visitorId) visitors.add(evt.visitorId);
  }
  return visitors.size;
}

/** @deprecated use listAnalyticsEventsSince */
export async function listAnalyticsEvents(limit = 5000) {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const events = await listAnalyticsEventsSince(since);
  return events.slice(0, limit);
}
