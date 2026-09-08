import Link from "next/link";
import { BarChart3, MousePointerClick, Users } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getAnalyticsSnapshot } from "@/lib/analytics/snapshot";
import { requireNavAccess } from "@/lib/dashboard-require-nav";
import { listLeads } from "@/lib/leads/storage";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  await requireNavAccess("overview");
  const [leads, snapshot] = await Promise.all([
    listLeads(),
    getAnalyticsSnapshot("30d"),
  ]);
  const newLeads = leads.filter((l) => l.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Übersicht
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-brand-dark sm:text-2xl">
          Willkommen im Dashboard
        </h2>
        <p className="mt-1 text-sm text-foreground/55">
          Analytics und Leads für{" "}
          <a
            href={siteConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-accent underline-offset-2 hover:underline"
          >
            {siteConfig.domain}
          </a>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Besucher (30 Tage)
            </p>
            <Users className="h-4 w-4 text-brand-accent" aria-hidden />
          </div>
          <p className="mt-2 text-3xl font-bold text-brand-dark">
            {snapshot.kpis.visitors.toLocaleString("de-DE")}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Leads gesamt
            </p>
            <MousePointerClick className="h-4 w-4 text-brand-accent" aria-hidden />
          </div>
          <p className="mt-2 text-3xl font-bold text-brand-dark">{leads.length}</p>
          {newLeads > 0 ? (
            <p className="mt-1 text-xs text-blue-600">{newLeads} neu</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
              Conversion Rate
            </p>
            <BarChart3 className="h-4 w-4 text-brand-accent" aria-hidden />
          </div>
          <p className="mt-2 text-3xl font-bold text-brand-dark">
            {snapshot.kpis.conversionRate.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold text-brand-dark">
            Schnellzugriff
          </h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard/website-analytics"
              className="rounded-lg bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Website Analytics
            </Link>
            <Link
              href="/dashboard/leads"
              className="rounded-lg border border-black/15 px-4 py-2.5 text-sm font-semibold text-brand-dark hover:border-brand-accent/50"
            >
              Alle Leads anzeigen
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-base font-extrabold text-brand-dark">
            WordPress Integration
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground/70">
            <li>
              Analytics:{" "}
              <code className="rounded bg-black/[0.04] px-1">
                POST /api/wordpress/analytics
              </code>
            </li>
            <li>
              Leads:{" "}
              <code className="rounded bg-black/[0.04] px-1">
                POST /api/wordpress/leads
              </code>
            </li>
            <li>Plugin: wordpress/tz-dashboard-connector.php</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
