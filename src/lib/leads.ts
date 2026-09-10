import { prisma } from "@/lib/db";
import type { LeadModel, ActivityModel } from "@/generated/prisma/models";
import {
  type ActivityType,
  type ChannelSource,
  type LeadStatus,
  CHANNEL_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  ACTIVITY_TYPES,
} from "@/lib/constants";
import { needsFollowUpNow, isOverdue, isDueToday, startOfDay } from "@/lib/dates";

/**
 * Data-access layer for leads and their activity history.
 *
 * Every mutation goes through the functions in this file rather than the UI
 * calling Prisma directly. That's deliberate: a future automated integration
 * (a WhatsApp webhook, a website contact form) can call `createLead` from a
 * route handler exactly the same way a Server Action does today, without
 * touching this module or the UI.
 */

export type LeadWithActivities = LeadModel & { activities: ActivityModel[] };

export interface LeadInput {
  businessName: string;
  contactName?: string | null;
  phone?: string | null;
  channelSource: ChannelSource;
  status?: LeadStatus;
  notes?: string | null;
  nextFollowUp?: Date | null;
}

export type LeadUpdateInput = Partial<LeadInput>;

export type LeadSortKey = "status" | "nextFollowUp" | "dateAdded";
export type LeadFilter = "all" | "needs_follow_up";

function assertChannelSource(value: string): asserts value is ChannelSource {
  if (!(CHANNEL_SOURCES as readonly string[]).includes(value)) {
    throw new Error(`Invalid channel source: ${value}`);
  }
}

function assertStatus(value: string): asserts value is LeadStatus {
  if (!(LEAD_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`Invalid lead status: ${value}`);
  }
}

function assertActivityType(value: string): asserts value is ActivityType {
  if (!(ACTIVITY_TYPES as readonly string[]).includes(value)) {
    throw new Error(`Invalid activity type: ${value}`);
  }
}

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

/** Creates a lead. This is the single entry point for adding a lead to the
 * pipeline, whether from the UI today or an automated source later. */
export async function createLead(input: LeadInput): Promise<LeadModel> {
  const businessName = input.businessName.trim();
  if (!businessName) throw new Error("businessName is required");
  assertChannelSource(input.channelSource);

  const status = input.status ?? "NEW";
  assertStatus(status);

  return prisma.lead.create({
    data: {
      businessName,
      contactName: normalize(input.contactName),
      phone: normalize(input.phone),
      channelSource: input.channelSource,
      status,
      notes: normalize(input.notes),
      nextFollowUp: input.nextFollowUp ?? null,
      closedAt: CLOSED_STATUSES.includes(status) ? new Date() : null,
    },
  });
}

export async function updateLead(id: string, input: LeadUpdateInput): Promise<LeadModel> {
  if (input.channelSource) assertChannelSource(input.channelSource);
  if (input.status) assertStatus(input.status);

  const existing = await prisma.lead.findUniqueOrThrow({ where: { id } });
  const nextStatus = input.status ?? (existing.status as LeadStatus);

  let closedAt = existing.closedAt;
  const wasClosed = CLOSED_STATUSES.includes(existing.status as LeadStatus);
  const isClosed = CLOSED_STATUSES.includes(nextStatus);
  if (isClosed && !wasClosed) closedAt = new Date();
  if (!isClosed && wasClosed) closedAt = null;

  const data: Record<string, unknown> = { closedAt };
  if (input.businessName !== undefined) {
    const businessName = input.businessName.trim();
    if (!businessName) throw new Error("businessName is required");
    data.businessName = businessName;
  }
  if (input.contactName !== undefined) data.contactName = normalize(input.contactName);
  if (input.phone !== undefined) data.phone = normalize(input.phone);
  if (input.channelSource !== undefined) data.channelSource = input.channelSource;
  if (input.status !== undefined) data.status = input.status;
  if (input.notes !== undefined) data.notes = normalize(input.notes);
  if (input.nextFollowUp !== undefined) data.nextFollowUp = input.nextFollowUp;

  const updated = await prisma.lead.update({ where: { id }, data });

  if (input.status !== undefined && input.status !== existing.status) {
    await addActivity(id, {
      type: "STATUS_CHANGE",
      content: `Status changed to "${LEAD_STATUS_LABELS[input.status]}"`,
    });
  }

  return updated;
}

export async function deleteLead(id: string): Promise<void> {
  await prisma.lead.delete({ where: { id } });
}

export async function getLeadById(id: string): Promise<LeadWithActivities | null> {
  return prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
}

export async function getLeads(options: {
  sortBy?: LeadSortKey;
  sortDir?: "asc" | "desc";
  filter?: LeadFilter;
} = {}): Promise<LeadModel[]> {
  const { sortBy = "nextFollowUp", sortDir = "asc", filter = "all" } = options;

  // Status has no natural alphabetical order — sort by pipeline stage
  // instead, which means fetching unsorted here and ordering in JS below.
  const leads = await prisma.lead.findMany({
    orderBy: sortBy === "status" ? { dateAdded: "desc" } : { [sortBy]: sortDir },
  });

  if (sortBy === "status") {
    const rank = (status: string) => {
      const i = LEAD_STATUSES.indexOf(status as LeadStatus);
      return i === -1 ? LEAD_STATUSES.length : i;
    };
    leads.sort((a, b) => {
      const diff = rank(a.status) - rank(b.status);
      return sortDir === "asc" ? diff : -diff;
    });
  }

  if (filter === "needs_follow_up") {
    return leads.filter(
      (lead) =>
        needsFollowUpNow(lead.nextFollowUp) &&
        !CLOSED_STATUSES.includes(lead.status as LeadStatus),
    );
  }

  return leads;
}

export async function addActivity(
  leadId: string,
  input: { type: ActivityType; content: string },
): Promise<ActivityModel> {
  assertActivityType(input.type);
  const content = input.content.trim();
  if (!content) throw new Error("content is required");

  return prisma.activity.create({
    data: { leadId, type: input.type, content },
  });
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  closedThisMonth: number;
  dueToday: number;
  overdue: number;
}

/** Human-readable status line for the dashboard header, e.g.
 * "3 leads need follow-up today, 2 overdue". */
export function followUpStatusLine(stats: DashboardStats): string {
  if (stats.dueToday === 0 && stats.overdue === 0) {
    return "No follow-ups due today — you're all caught up.";
  }
  const parts: string[] = [];
  if (stats.dueToday > 0) {
    parts.push(`${stats.dueToday} lead${stats.dueToday === 1 ? "" : "s"} need${stats.dueToday === 1 ? "s" : ""} follow-up today`);
  }
  if (stats.overdue > 0) {
    parts.push(`${stats.overdue} overdue`);
  }
  return parts.join(", ") + ".";
}

export async function getDashboardStats(now = new Date()): Promise<DashboardStats> {
  const leads = await prisma.lead.findMany({
    select: { status: true, nextFollowUp: true, closedAt: true },
  });

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let hotLeads = 0;
  let dueToday = 0;
  let overdue = 0;
  let closedThisMonth = 0;

  for (const lead of leads) {
    const isClosed = CLOSED_STATUSES.includes(lead.status as LeadStatus);
    if (!isClosed) {
      if (isDueToday(lead.nextFollowUp, now)) dueToday += 1;
      if (isOverdue(lead.nextFollowUp, now)) overdue += 1;
      if (needsFollowUpNow(lead.nextFollowUp, now)) hotLeads += 1;
    }
    if (lead.closedAt && lead.closedAt >= monthStart) closedThisMonth += 1;
  }

  return {
    totalLeads: leads.length,
    hotLeads,
    closedThisMonth,
    dueToday,
    overdue,
  };
}

export interface LeadsAddedPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

/** Leads added per day for the last N days (default 30), oldest first. */
export async function getLeadsAddedTimeline(days = 30, now = new Date()): Promise<LeadsAddedPoint[]> {
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (days - 1));

  const leads = await prisma.lead.findMany({
    where: { dateAdded: { gte: start } },
    select: { dateAdded: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    counts.set(toISODate(d), 0);
  }

  for (const lead of leads) {
    const key = toISODate(lead.dateAdded);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

function toISODate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function normalize(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
