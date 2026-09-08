"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Eye,
  Info,
  MousePointerClick,
  Percent,
  Users,
} from "lucide-react";
import { getEmptyAnalyticsSnapshot } from "@/lib/analytics/empty-analytics";
import type {
  AnalyticsPeriod,
  WebsiteAnalyticsSnapshot,
} from "@/lib/analytics/types";
import type { LeadListItem } from "@/lib/leads/types";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type WebsiteAnalyticsPanelProps = {
  initialSnapshot: WebsiteAnalyticsSnapshot | null;
  storedLeads: LeadListItem[];
};

function formatNumber(value: number) {
  return value.toLocaleString("de-DE");
}

function ChangeBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        positive ? "text-emerald-700" : "text-red-600",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div
        className="h-full rounded-full bg-brand-accent"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-extrabold text-brand-dark">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-foreground/55">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  label,
  value,
  icon,
  footer,
  changePct,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  footer?: string;
  changePct?: number;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/50">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-2 text-3xl font-bold text-brand-dark">{value}</p>
      {changePct !== undefined ? (
        <div className="mt-2">
          <ChangeBadge value={changePct} />
        </div>
      ) : null}
      {footer ? (
        <p className="mt-2 text-xs text-foreground/50">{footer}</p>
      ) : null}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-foreground/55">
      {message}
    </div>
  );
}

export function WebsiteAnalyticsPanel({
  initialSnapshot,
  storedLeads,
}: WebsiteAnalyticsPanelProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [snapshot, setSnapshot] = useState<WebsiteAnalyticsSnapshot>(
    initialSnapshot ?? getEmptyAnalyticsSnapshot("30d"),
  );
  const [error, setError] = useState<string | null>(null);

  async function loadSnapshot(nextPeriod: AnalyticsPeriod) {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/dashboard/analytics?period=${nextPeriod}`,
      );
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        snapshot?: WebsiteAnalyticsSnapshot;
      };
      if (!response.ok || !data.ok || !data.snapshot) {
        throw new Error(data.error || "Analytics konnten nicht geladen werden.");
      }
      setSnapshot(data.snapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ladefehler.");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSnapshot(period);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadSnapshot(period);
      }
    }, 30000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const hasData =
    snapshot.kpis.visitors > 0 ||
    snapshot.kpis.leads > 0 ||
    snapshot.leadSources.length > 0;

  const maxCountryVisitors = Math.max(
    ...(snapshot.countries?.map((row) => row.visitors) ?? [0]),
    1,
  );
  const maxDeviceVisitors = Math.max(
    ...(snapshot.devices?.map((row) => row.visitors) ?? [0]),
    1,
  );
  const maxLeadSource = Math.max(
    ...snapshot.leadSources.map((row) => row.leads),
    1,
  );
  const maxServiceViews = Math.max(
    ...snapshot.services.map((row) => row.views),
    1,
  );
  const maxCtaClicks = Math.max(...snapshot.ctas.map((row) => row.clicks), 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
            Einblicke
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-brand-dark sm:text-2xl">
            Website Analytics
          </h2>
          <p className="mt-1 text-sm text-foreground/55">
            Daten von {siteConfig.domain} — WordPress sendet Events an dieses
            Dashboard. Aktualisiert alle 30 Sekunden.
          </p>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>

        <div
          className="inline-flex rounded-lg border border-black/15 p-1"
          role="group"
          aria-label="Zeitraum"
        >
          {(
            [
              { id: "7d", label: "7 Tage" },
              { id: "30d", label: "30 Tage" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPeriod(option.id)}
              disabled={isRefreshing}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60",
                period === option.id
                  ? "bg-brand-dark text-white"
                  : "text-brand-dark/70 hover:text-brand-dark",
              )}
              aria-pressed={period === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Noch keine Analytics-Daten. Installieren und konfigurieren Sie das TZ
            Dashboard Connector Plugin auf {siteConfig.domain}. Besucher müssen
            Cookies akzeptieren (Real Cookie Banner), damit Tracking startet.
          </p>
        </div>
      ) : (
        <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Live-Daten von {siteConfig.domain}. Events werden über{" "}
            <code className="rounded bg-white/60 px-1">/api/wordpress/*</code>{" "}
            empfangen.
          </p>
        </div>
      )}

      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
          isRefreshing && "opacity-60",
        )}
        aria-busy={isRefreshing}
      >
        <KpiCard
          label="Besucher"
          value={formatNumber(snapshot.kpis.visitors)}
          changePct={snapshot.kpis.visitorsChangePct}
          icon={<Users className="h-4 w-4 text-brand-accent" aria-hidden />}
        />
        <KpiCard
          label="Leads"
          value={formatNumber(snapshot.kpis.leads)}
          changePct={snapshot.kpis.leadsChangePct}
          footer={
            storedLeads.length > 0
              ? `${storedLeads.length} gespeicherte Anfrage(n)`
              : "Warten auf WordPress-Formulare"
          }
          icon={
            <MousePointerClick className="h-4 w-4 text-brand-accent" aria-hidden />
          }
        />
        <KpiCard
          label="Conversion Rate"
          value={`${snapshot.kpis.conversionRate.toFixed(2)}%`}
          footer="Leads ÷ Besucher"
          icon={<Percent className="h-4 w-4 text-brand-accent" aria-hidden />}
        />
        <KpiCard
          label="Consent Rate"
          value={`${snapshot.kpis.consentRate}%`}
          footer="Cookie-Zustimmung (Real Cookie Banner)"
          icon={<Eye className="h-4 w-4 text-brand-accent" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Leads nach Quelle"
          description="WhatsApp, Anruf, Kontaktformular — welche Kanäle funktionieren?"
        >
          {snapshot.leadSources.length === 0 ? (
            <EmptyState message="Noch keine Leads. WordPress-Formulare senden automatisch hierher." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="px-1 py-2 font-semibold text-brand-dark/80">
                      Quelle
                    </th>
                    <th className="w-20 px-1 py-2 font-semibold text-brand-dark/80">
                      Leads
                    </th>
                    <th className="w-28 px-1 py-2 font-semibold text-brand-dark/80">
                      Anteil
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.leadSources.map((row) => (
                    <tr key={row.formKey} className="border-b border-black/5">
                      <td className="truncate px-1 py-2.5 font-medium text-brand-dark">
                        {row.label}
                      </td>
                      <td className="px-1 py-2.5 text-foreground/80">
                        {row.leads}
                      </td>
                      <td className="px-1 py-2.5">
                        <div className="flex items-center gap-2">
                          <Bar value={row.leads} max={maxLeadSource} />
                          <span className="w-8 shrink-0 text-xs text-foreground/55">
                            {row.sharePct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Service-Nachfrage"
          description="Seitenaufrufe vs. Leads pro Leistung — Reifenservice, Getriebespülung, KFZ, etc."
        >
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="px-1 py-2 font-semibold text-brand-dark/80">
                    Leistung
                  </th>
                  <th className="w-24 px-1 py-2 font-semibold text-brand-dark/80">
                    Aufrufe
                  </th>
                  <th className="w-20 px-1 py-2 font-semibold text-brand-dark/80">
                    Leads
                  </th>
                  <th className="w-40 px-1 py-2 font-semibold text-brand-dark/80">
                    Interesse
                  </th>
                </tr>
              </thead>
              <tbody>
                {snapshot.services.map((row) => (
                  <tr key={row.id} className="border-b border-black/5">
                    <td className="px-1 py-2.5 font-semibold text-brand-dark">
                      {row.label}
                    </td>
                    <td className="px-1 py-2.5 text-foreground/80">
                      {formatNumber(row.views)}
                    </td>
                    <td className="px-1 py-2.5 text-foreground/80">
                      {row.leads}
                    </td>
                    <td className="px-1 py-2.5">
                      <Bar value={row.views} max={maxServiceViews} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Besucher nach Land">
          {snapshot.countries.length === 0 ? (
            <EmptyState message="Noch keine Besucherdaten." />
          ) : (
            <ul className="space-y-3">
              {snapshot.countries.map((row) => (
                <li key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-brand-dark">{row.label}</span>
                    <span className="text-foreground/60">
                      {formatNumber(row.visitors)} ({row.sharePct}%)
                    </span>
                  </div>
                  <Bar value={row.visitors} max={maxCountryVisitors} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Geräte">
          {snapshot.devices.length === 0 ? (
            <EmptyState message="Noch keine Gerätedaten." />
          ) : (
            <ul className="space-y-3">
              {snapshot.devices.map((row) => (
                <li key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-brand-dark">{row.label}</span>
                    <span className="text-foreground/60">
                      {formatNumber(row.visitors)} ({row.sharePct}%)
                    </span>
                  </div>
                  <Bar value={row.visitors} max={maxDeviceVisitors} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="WordPress Website">
          <ul className="space-y-2 text-sm text-foreground/70">
            <li className="rounded-lg border border-black/10 px-3 py-2">
              <strong>Domain:</strong> {siteConfig.domain}
            </li>
            <li className="rounded-lg border border-black/10 px-3 py-2">
              <strong>CMS:</strong> WordPress + Real Cookie Banner
            </li>
            <li className="rounded-lg border border-black/10 px-3 py-2">
              <strong>Endpoint:</strong> POST /api/wordpress/analytics
            </li>
            <li className="rounded-lg border border-black/10 px-3 py-2">
              <strong>Leads:</strong> POST /api/wordpress/leads
            </li>
          </ul>
          <a
            href={siteConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-bold text-brand-dark transition-colors hover:border-brand-accent/50"
          >
            Website öffnen
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="CTA Performance">
          {snapshot.ctas.length === 0 ? (
            <EmptyState message="Noch keine CTA-Klicks erfasst." />
          ) : (
            <ul className="space-y-4">
              {snapshot.ctas.map((row) => (
                <li key={row.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-brand-dark">{row.label}</span>
                    <span className="text-foreground/60">
                      {formatNumber(row.clicks)} Klicks
                      {row.conversions > 0 ? ` · ${row.conversions} Leads` : ""}
                    </span>
                  </div>
                  <Bar value={row.clicks} max={maxCtaClicks} />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Top Seiten">
          {snapshot.topPages.length === 0 ? (
            <EmptyState message="Noch keine Seitenaufrufe erfasst." />
          ) : (
            <ul className="divide-y divide-black/5">
              {snapshot.topPages.map((row) => (
                <li
                  key={row.path}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-brand-dark">
                      {row.label}
                    </p>
                    <p className="truncate text-xs text-foreground/50">
                      {row.path}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold text-brand-dark">
                      {formatNumber(row.views)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
