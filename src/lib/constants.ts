// SQLite has no native enum type, so these are the single source of truth
// for the allowed values Prisma stores as plain strings on Lead/Activity.
// The data-access layer (lib/leads.ts) validates against these before writing.

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  MEETING_SCHEDULED: "Meeting scheduled",
  PROPOSAL_SENT: "Proposal sent",
  CLOSED_WON: "Closed-Won",
  CLOSED_LOST: "Closed-Lost",
};

// Text color classes only — no background chips. Keeps the list view
// disciplined (per design principles) rather than a wall of colored pills.
export const LEAD_STATUS_TEXT_CLASS: Record<LeadStatus, string> = {
  NEW: "text-foreground/55",
  CONTACTED: "text-foreground/80",
  INTERESTED: "text-primary",
  MEETING_SCHEDULED: "text-primary",
  PROPOSAL_SENT: "text-primary font-medium",
  CLOSED_WON: "text-emerald-400",
  CLOSED_LOST: "text-foreground/35 line-through decoration-foreground/25",
};

export const OPEN_LEAD_STATUSES: LeadStatus[] = LEAD_STATUSES.filter(
  (s) => s !== "CLOSED_WON" && s !== "CLOSED_LOST",
);

export const CHANNEL_SOURCES = [
  "MANUAL_OUTREACH",
  "WEBSITE_FORM",
  "WHATSAPP_INQUIRY",
  "REFERRAL",
  "OTHER",
] as const;

export type ChannelSource = (typeof CHANNEL_SOURCES)[number];

export const CHANNEL_SOURCE_LABELS: Record<ChannelSource, string> = {
  MANUAL_OUTREACH: "Manual outreach",
  WEBSITE_FORM: "Website form",
  WHATSAPP_INQUIRY: "WhatsApp inquiry",
  REFERRAL: "Referral",
  OTHER: "Other",
};

export const ACTIVITY_TYPES = [
  "NOTE",
  "CALL",
  "EMAIL",
  "MEETING",
  "STATUS_CHANGE",
  "OTHER",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  NOTE: "Note",
  CALL: "Call",
  EMAIL: "Email",
  MEETING: "Meeting",
  STATUS_CHANGE: "Status change",
  OTHER: "Other",
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export function isChannelSource(value: string): value is ChannelSource {
  return (CHANNEL_SOURCES as readonly string[]).includes(value);
}

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}
