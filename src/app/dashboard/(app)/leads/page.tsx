import { LeadsPanel } from "@/components/dashboard/leads-panel";
import { listLeads } from "@/lib/leads/storage";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await listLeads();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
          Posteingang
        </p>
        <h2 className="mt-1 text-xl font-extrabold text-brand-dark sm:text-2xl">
          Alle Website-Leads
        </h2>
        <p className="mt-1 text-sm text-foreground/55">
          Kontaktformulare, WhatsApp, Anrufe und Leistungs-Anfragen von
          timezone-reifenservice.de.
        </p>
      </div>

      <LeadsPanel leads={leads} />
    </div>
  );
}
