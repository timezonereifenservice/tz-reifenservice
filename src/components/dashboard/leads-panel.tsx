"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { LeadListItem, LeadStatus, LeadType } from "@/lib/leads/types";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<LeadType, string> = {
  contact: "Kontakt",
  whatsapp: "WhatsApp",
  phone: "Anruf",
  service: "Leistung",
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Neu",
  READ: "Gelesen",
  ARCHIVED: "Archiviert",
};

const TYPE_FILTERS: Array<{ id: LeadType | "all"; label: string }> = [
  { id: "all", label: "Alle" },
  { id: "contact", label: "Kontakt" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "phone", label: "Anruf" },
  { id: "service", label: "Leistung" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type LeadsPanelProps = {
  leads: LeadListItem[];
};

export function LeadsPanel({ leads }: LeadsPanelProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LeadType | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (typeFilter !== "all" && lead.type !== typeFilter) return false;
      if (!q) return true;
      return (
        lead.fullName.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.toLowerCase().includes(q) ||
        lead.service?.toLowerCase().includes(q) ||
        lead.sourceLabel.toLowerCase().includes(q)
      );
    });
  }, [leads, query, typeFilter]);

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center">
        <p className="text-base font-semibold text-brand-dark">Noch keine Leads</p>
        <p className="mt-2 text-sm text-foreground/55">
          Kontaktformulare, WhatsApp-Klicks und Anrufe von timezone-reifenservice.de
          erscheinen hier automatisch.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen nach Name, E-Mail, Telefon…"
            className="w-full rounded-lg border border-black/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
          />
        </div>
        <p className="text-sm text-foreground/55">
          {filtered.length} von {leads.length} Leads
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setTypeFilter(filter.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              typeFilter === filter.id
                ? "bg-brand-dark text-white"
                : "bg-black/[0.05] text-brand-dark/70 hover:bg-black/[0.08]",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02]">
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Datum</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Name</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Kontakt</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Leistung</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Quelle</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Typ</th>
                <th className="px-4 py-3 font-semibold text-brand-dark/80">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-black/5 transition-colors hover:bg-black/[0.02]"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-foreground/60">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {lead.fullName || "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    <div>{lead.email || "—"}</div>
                    <div className="text-xs text-foreground/50">
                      {lead.phone || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {lead.service || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-dark">
                      {lead.sourceLabel}
                    </div>
                    <div className="text-xs text-foreground/50">
                      {lead.sourcePage}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-black/[0.05] px-2 py-0.5 text-xs font-semibold">
                      {TYPE_LABELS[lead.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-semibold",
                        lead.status === "NEW"
                          ? "bg-blue-100 text-blue-800"
                          : lead.status === "READ"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-black/[0.06] text-foreground/60",
                      )}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
