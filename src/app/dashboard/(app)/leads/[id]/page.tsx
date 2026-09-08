import { notFound } from "next/navigation";
import { LeadDetailView } from "@/components/dashboard/lead-detail-view";
import { requireNavAccess } from "@/lib/dashboard-require-nav";
import { getLeadById } from "@/lib/leads/storage";

export const dynamic = "force-dynamic";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  await requireNavAccess("leads");
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  return <LeadDetailView lead={lead} />;
}
