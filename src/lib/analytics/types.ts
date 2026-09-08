export type AnalyticsPeriod = "7d" | "30d";

export type AnalyticsKpis = {
  visitors: number;
  leads: number;
  conversionRate: number;
  consentRate: number;
  visitorsChangePct: number;
  leadsChangePct: number;
};

export type LeadSourceRow = {
  formKey: string;
  label: string;
  leads: number;
  sharePct: number;
};

export type ServiceDemandRow = {
  id: string;
  label: string;
  path: string;
  views: number;
  leads: number;
};

export type CtaPerformanceRow = {
  id: string;
  label: string;
  clicks: number;
  conversions: number;
};

export type TopPageRow = {
  path: string;
  label: string;
  views: number;
  engagementRate: number;
};

export type BreakdownRow = {
  key: string;
  label: string;
  visitors: number;
  sharePct: number;
};

export type WebsiteAnalyticsSnapshot = {
  period: AnalyticsPeriod;
  kpis: AnalyticsKpis;
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
  leadSources: LeadSourceRow[];
  services: ServiceDemandRow[];
  ctas: CtaPerformanceRow[];
  topPages: TopPageRow[];
};

export type AnalyticsEventType = "page_view" | "cta_click" | "consent";

export type AnalyticsEvent = {
  id: string;
  createdAt: string;
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
  source: "wordpress" | "dashboard";
};
