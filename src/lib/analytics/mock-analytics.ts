import type { AnalyticsPeriod, WebsiteAnalyticsSnapshot } from "./types";

/** Mock preview data for Time Zone Reifenservice (Pulheim). */
const SNAPSHOT_30D: WebsiteAnalyticsSnapshot = {
  period: "30d",
  kpis: {
    visitors: 3240,
    leads: 86,
    conversionRate: 2.65,
    consentRate: 72,
    visitorsChangePct: 9.3,
    leadsChangePct: 14.2,
  },
  countries: [
    { key: "DE", label: "Deutschland", visitors: 2890, sharePct: 89 },
    { key: "NL", label: "Niederlande", visitors: 180, sharePct: 6 },
    { key: "BE", label: "Belgien", visitors: 95, sharePct: 3 },
    { key: "unknown", label: "Unbekannt", visitors: 75, sharePct: 2 },
  ],
  devices: [
    { key: "Mobile", label: "Mobil", visitors: 1780, sharePct: 55 },
    { key: "Desktop", label: "Desktop", visitors: 1320, sharePct: 41 },
    { key: "Tablet", label: "Tablet", visitors: 140, sharePct: 4 },
  ],
  browsers: [
    { key: "Chrome", label: "Chrome", visitors: 1820, sharePct: 56 },
    { key: "Safari", label: "Safari", visitors: 680, sharePct: 21 },
    { key: "Samsung", label: "Samsung Internet", visitors: 320, sharePct: 10 },
    { key: "Firefox", label: "Firefox", visitors: 240, sharePct: 7 },
    { key: "Edge", label: "Edge", visitors: 180, sharePct: 6 },
  ],
  leadSources: [
    { formKey: "whatsapp", label: "WhatsApp Widget", leads: 28, sharePct: 33 },
    { formKey: "phone", label: "Anruf-Button", leads: 22, sharePct: 26 },
    { formKey: "contact-form", label: "Kontaktformular", leads: 18, sharePct: 21 },
    { formKey: "service-inquiry", label: "Leistungs-Anfrage", leads: 12, sharePct: 14 },
    { formKey: "email", label: "E-Mail Link", leads: 6, sharePct: 7 },
  ],
  services: [
    { id: "reifen", label: "Reifenservice", path: "/reifenservice", views: 890, leads: 24 },
    { id: "getriebe", label: "Getriebespülung", path: "/getriebespuelung", views: 620, leads: 18 },
    { id: "kfz", label: "KFZ Service", path: "/kfz-service", views: 540, leads: 12 },
    { id: "klima", label: "Klimaservice", path: "/klimaservice", views: 410, leads: 9 },
    { id: "oel", label: "Ölwechsel", path: "/oelwechsel-service", views: 380, leads: 8 },
    { id: "glas", label: "Autoglas Service", path: "/autoglas-service", views: 290, leads: 6 },
    { id: "achs", label: "Achsvermessung", path: "/achsvermessung", views: 220, leads: 5 },
    { id: "tuning", label: "Fahrzeugtuning", path: "/fahrzeugtuning", views: 180, leads: 4 },
  ],
  ctas: [
    { id: "whatsapp", label: "WhatsApp", clicks: 412, conversions: 28 },
    { id: "call", label: "Jetzt anrufen", clicks: 356, conversions: 22 },
    { id: "contact", label: "Kontaktformular", clicks: 198, conversions: 18 },
    { id: "services", label: "Unsere Leistungen", clicks: 284, conversions: 0 },
    { id: "email", label: "E-Mail senden", clicks: 92, conversions: 6 },
  ],
  topPages: [
    { path: "/", label: "Startseite", views: 1240, engagementRate: 68 },
    { path: "/reifenservice", label: "Reifenservice", views: 890, engagementRate: 74 },
    { path: "/getriebespuelung", label: "Getriebespülung", views: 620, engagementRate: 71 },
    { path: "/kontakt", label: "Kontakt", views: 480, engagementRate: 82 },
    { path: "/kfz-service", label: "KFZ Service", views: 540, engagementRate: 65 },
    { path: "/klimaservice", label: "Klimaservice", views: 410, engagementRate: 63 },
  ],
};

const SNAPSHOT_7D: WebsiteAnalyticsSnapshot = {
  ...SNAPSHOT_30D,
  period: "7d",
  kpis: {
    visitors: 812,
    leads: 24,
    conversionRate: 2.96,
    consentRate: 74,
    visitorsChangePct: 5.1,
    leadsChangePct: 11.8,
  },
};

export function getMockAnalyticsSnapshot(
  period: AnalyticsPeriod,
): WebsiteAnalyticsSnapshot {
  return period === "7d" ? SNAPSHOT_7D : SNAPSHOT_30D;
}
