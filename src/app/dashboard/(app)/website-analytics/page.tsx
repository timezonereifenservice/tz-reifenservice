import { WebsiteAnalyticsPanel } from "@/components/dashboard/website-analytics-panel";
import { getAnalyticsSnapshot } from "@/lib/analytics/snapshot";
import { requireNavAccess } from "@/lib/dashboard-require-nav";
import { listLeads } from "@/lib/leads/storage";

export const dynamic = "force-dynamic";

export default async function WebsiteAnalyticsPage() {
  await requireNavAccess("website-analytics");
  const [leads, snapshot] = await Promise.all([
    listLeads(),
    getAnalyticsSnapshot("30d"),
  ]);

  return (
    <WebsiteAnalyticsPanel initialSnapshot={snapshot} storedLeads={leads} />
  );
}
