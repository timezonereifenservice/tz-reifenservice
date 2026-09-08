import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Lead } from "@/lib/leads/types";

type LeadDetailViewProps = {
  lead: Lead;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayValue(value: string | undefined) {
  return value?.trim() ? value : "—";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-black/5 py-3.5 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm font-semibold text-brand-dark/70">{label}</dt>
      <dd className="whitespace-pre-wrap break-words text-sm text-brand-dark">
        {displayValue(value)}
      </dd>
    </div>
  );
}

const TYPE_LABELS: Record<Lead["type"], string> = {
  contact: "Kontakt",
  whatsapp: "WhatsApp",
  phone: "Anruf",
  service: "Leistung",
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  NEW: "Neu",
  READ: "Gelesen",
  ARCHIVED: "Archiviert",
};

export function LeadDetailView({ lead }: LeadDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-dark/70 transition-colors hover:text-brand-dark"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Zurück zu Leads
        </Link>
        <p className="text-sm text-foreground/55">{formatDate(lead.createdAt)}</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-black/5 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/50">
              Lead-Details
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-dark">
              {displayValue(lead.fullName)}
            </h2>
            <p className="mt-1 text-sm text-foreground/55">
              {displayValue(lead.sourceLabel)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-black/[0.05] px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-dark">
              {TYPE_LABELS[lead.type]}
            </span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              {STATUS_LABELS[lead.status]}
            </span>
          </div>
        </div>

        <dl>
          <DetailRow label="Name" value={lead.fullName} />
          <DetailRow label="E-Mail" value={lead.email} />
          <DetailRow label="Telefon" value={lead.phone} />
          <DetailRow label="Leistung" value={lead.service ?? ""} />
          <DetailRow label="Nachricht" value={lead.message} />
          <DetailRow label="Quelle" value={lead.sourceLabel} />
          <DetailRow label="Seite" value={lead.sourcePage} />
          <DetailRow label="Formular-Key" value={lead.formKey} />
          <DetailRow label="Eingegangen am" value={formatDate(lead.createdAt)} />
          <DetailRow label="Lead-ID" value={lead.id} />
        </dl>
      </div>
    </div>
  );
}
