export type LeadType = "contact" | "whatsapp" | "phone" | "service";

export type LeadStatus = "NEW" | "READ" | "ARCHIVED";

export const LEAD_STATUSES: LeadStatus[] = ["NEW", "READ", "ARCHIVED"];

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  type: LeadType;
  status: LeadStatus;
  formKey: string;
  sourcePage: string;
  sourceLabel: string;
  fullName: string;
  email: string;
  phone: string;
  service?: string;
  message: string;
  source: "wordpress" | "manual";
};

export type LeadInput = {
  type: LeadType;
  formKey: string;
  sourcePage?: string;
  sourceLabel?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: "wordpress" | "manual";
};

export type LeadListItem = Pick<
  Lead,
  | "id"
  | "createdAt"
  | "fullName"
  | "email"
  | "phone"
  | "service"
  | "sourceLabel"
  | "sourcePage"
  | "type"
  | "formKey"
  | "status"
  | "source"
>;
