import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { mapLeadRow, toLeadListItem, type LeadRow } from "@/lib/leads/map";
import type { Lead, LeadInput, LeadListItem, LeadStatus } from "@/lib/leads/types";
import { MOCK_LEADS } from "@/lib/leads/mock-data";

const LEAD_SELECT =
  "id, created_at, updated_at, type, status, form_key, source_page, source_label, full_name, email, phone, service, message, source" as const;

function memoryLeadsFromMock(): Lead[] {
  return MOCK_LEADS.map((item) => ({
    ...item,
    message: "",
    updatedAt: item.createdAt,
  }));
}

let memoryLeads: Lead[] | null = null;

function getMemoryLeads() {
  if (!memoryLeads) memoryLeads = memoryLeadsFromMock();
  return memoryLeads;
}

export async function createLead(input: LeadInput): Promise<Lead> {
  if (!isSupabaseConfigured()) {
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const lead: Lead = {
      id,
      createdAt: now,
      updatedAt: now,
      type: input.type,
      status: "NEW",
      formKey: input.formKey,
      sourcePage: input.sourcePage ?? "/",
      sourceLabel: input.sourceLabel ?? input.formKey,
      fullName: input.fullName ?? "",
      email: input.email ?? "",
      phone: input.phone ?? "",
      service: input.service ?? "",
      message: input.message ?? "",
      source: input.source ?? "wordpress",
    };
    getMemoryLeads().unshift(lead);
    return lead;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .insert({
      type: input.type,
      status: "NEW",
      form_key: input.formKey,
      source_page: input.sourcePage ?? "/",
      source_label: input.sourceLabel ?? input.formKey,
      full_name: input.fullName ?? "",
      email: input.email ?? "",
      phone: input.phone ?? "",
      service: input.service ?? "",
      message: input.message ?? "",
      source: input.source ?? "wordpress",
    })
    .select(LEAD_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapLeadRow(data as LeadRow);
}

export async function listLeads(): Promise<LeadListItem[]> {
  if (!isSupabaseConfigured()) {
    return getMemoryLeads().map(toLeadListItem);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => toLeadListItem(mapLeadRow(row as LeadRow)));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!isSupabaseConfigured()) {
    return getMemoryLeads().find((l) => l.id === id) ?? null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapLeadRow(data as LeadRow);
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<Lead> {
  if (!isSupabaseConfigured()) {
    const lead = getMemoryLeads().find((l) => l.id === id);
    if (!lead) throw new Error("Lead not found");
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id)
    .select(LEAD_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return mapLeadRow(data as LeadRow);
}
