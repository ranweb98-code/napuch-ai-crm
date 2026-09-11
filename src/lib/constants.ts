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
  NEW: "חדש",
  CONTACTED: "נוצר קשר",
  INTERESTED: "מתעניין",
  MEETING_SCHEDULED: "פגישה נקבעה",
  PROPOSAL_SENT: "הצעה נשלחה",
  CLOSED_WON: "נסגר-זכייה",
  CLOSED_LOST: "נסגר-אבד",
};

// Soft tinted-background pills, matching the reference design's status
// badges (e.g. "Terminée" / "En cours" / "En attente").
export const LEAD_STATUS_PILL_CLASS: Record<LeadStatus, string> = {
  NEW: "bg-border text-muted",
  CONTACTED: "bg-info-tint text-info",
  INTERESTED: "bg-primary-tint text-primary-text",
  MEETING_SCHEDULED: "bg-primary-tint text-primary-text",
  PROPOSAL_SENT: "bg-warning-tint text-warning",
  CLOSED_WON: "bg-success-tint text-success",
  CLOSED_LOST: "bg-danger-tint text-danger",
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
  MANUAL_OUTREACH: "פנייה יזומה",
  WEBSITE_FORM: "טופס באתר",
  WHATSAPP_INQUIRY: "פנייה בוואטסאפ",
  REFERRAL: "הפניה",
  OTHER: "אחר",
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
  NOTE: "הערה",
  CALL: "שיחת טלפון",
  EMAIL: "אימייל",
  MEETING: "פגישה",
  STATUS_CHANGE: "שינוי סטטוס",
  OTHER: "אחר",
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
