import { WebsiteAnalyticsPanel } from "@/components/dashboard/website-analytics-panel";
import { getMockAnalyticsSnapshot } from "@/lib/analytics/mock-analytics";
import { requireNavAccess } from "@/lib/dashboard-require-nav";
import { listLeads } from "@/lib/leads/storage";

export const dynamic = "force-dynamic";

export default async function WebsiteAnalyticsPage() {
  await requireNavAccess("website-analytics");
  const leads = await listLeads();

  return (
    <WebsiteAnalyticsPanel
      initialSnapshot={getMockAnalyticsSnapshot("30d")}
      storedLeads={leads}
    />
  );
}
