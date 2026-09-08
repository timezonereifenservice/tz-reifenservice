import type { AnalyticsPeriod, WebsiteAnalyticsSnapshot } from "./types";

export function getEmptyAnalyticsSnapshot(
  period: AnalyticsPeriod = "30d",
): WebsiteAnalyticsSnapshot {
  return {
    period,
    kpis: {
      visitors: 0,
      leads: 0,
      conversionRate: 0,
      consentRate: 0,
      visitorsChangePct: 0,
      leadsChangePct: 0,
    },
    countries: [],
    devices: [],
    browsers: [],
    leadSources: [],
    services: [],
    ctas: [],
    topPages: [],
  };
}
