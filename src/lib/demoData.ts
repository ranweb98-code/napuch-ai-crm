import type { LeadModel } from "@/generated/prisma/models";
import {
  LEAD_STATUSES,
  type LeadStatus,
  type ChannelSource,
} from "@/lib/constants";
import type { DashboardStats, LeadsAddedPoint, LeadSortKey, LeadFilter } from "@/lib/leads";
import { startOfDay, isOverdue, isDueToday, needsFollowUpNow } from "@/lib/dates";

/**
 * Cosmetic-only sample pipeline for empty accounts. Nothing here touches
 * the database — one seed list drives both the dashboard and the leads
 * list, computed with the exact same aggregation logic the real
 * lib/leads.ts functions use, so the two pages always agree with each
 * other. The moment a real lead exists, both pages switch to the real
 * data functions and this module is never called.
 */

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

interface DemoSeed {
  businessName: string;
  contactName: string | null;
  phone: string | null;
  channelSource: ChannelSource;
  status: LeadStatus;
  notes: string | null;
  daysAgoAdded: number;
  followUpOffsetDays: number | null;
  closedDaysAgo?: number;
}

const SEEDS: DemoSeed[] = [
  // NEW
  { businessName: "סולרה פיטנס", contactName: "תומר אזולאי", phone: "050-111-2222", channelSource: "REFERRAL", status: "NEW", notes: null, daysAgoAdded: 1, followUpOffsetDays: null },
  { businessName: "אביב הנהלת חשבונות", contactName: "יוסי מזרחי", phone: "054-222-3333", channelSource: "MANUAL_OUTREACH", status: "NEW", notes: null, daysAgoAdded: 3, followUpOffsetDays: -2 },
  { businessName: "גרינפילד גינון ונוף", contactName: "רונית שגיא", phone: "052-333-4444", channelSource: "WEBSITE_FORM", status: "NEW", notes: null, daysAgoAdded: 5, followUpOffsetDays: 2 },
  { businessName: "טקנסט קואורקינג", contactName: null, phone: "053-444-5555", channelSource: "OTHER", status: "NEW", notes: null, daysAgoAdded: 9, followUpOffsetDays: null },
  { businessName: "מרינה ביי יאכטות", contactName: "אלון פרץ", phone: "050-555-6666", channelSource: "REFERRAL", status: "NEW", notes: null, daysAgoAdded: 12, followUpOffsetDays: 5 },

  // CONTACTED
  { businessName: "נורת'גייט נדל\"ן", contactName: null, phone: "052-666-7777", channelSource: "MANUAL_OUTREACH", status: "CONTACTED", notes: null, daysAgoAdded: 8, followUpOffsetDays: -1 },
  { businessName: "הארבור וויו הוטל", contactName: "ליאור פרץ", phone: "054-777-8888", channelSource: "WHATSAPP_INQUIRY", status: "CONTACTED", notes: null, daysAgoAdded: 6, followUpOffsetDays: 2 },
  { businessName: "מאפיית קרסנט", contactName: "רוני שגב", phone: "050-888-9999", channelSource: "WEBSITE_FORM", status: "CONTACTED", notes: "התעניינה במחיר לאירוע חברה.", daysAgoAdded: 10, followUpOffsetDays: 0 },
  { businessName: "אילן מוסך ותיקונים", contactName: "אילן כהן", phone: "053-999-0000", channelSource: "MANUAL_OUTREACH", status: "CONTACTED", notes: null, daysAgoAdded: 14, followUpOffsetDays: 4 },
  { businessName: "לומן סטודיו לעיצוב", contactName: null, phone: "052-000-1111", channelSource: "OTHER", status: "CONTACTED", notes: null, daysAgoAdded: 16, followUpOffsetDays: null },
  { businessName: "מרכז ייעוץ עסקי סחלב", contactName: "רותם אבידן", phone: "054-111-3333", channelSource: "REFERRAL", status: "CONTACTED", notes: null, daysAgoAdded: 18, followUpOffsetDays: -3 },

  // INTERESTED
  { businessName: "מרפאת שיניים כפר סבא", contactName: "ד\"ר מיכל לוי", phone: "050-222-4444", channelSource: "WHATSAPP_INQUIRY", status: "INTERESTED", notes: "שאלה לגבי מסלולי המחיר.", daysAgoAdded: 6, followUpOffsetDays: 0 },
  { businessName: "סילבר ליין הפקת אירועים", contactName: "רון סילברמן", phone: "052-333-5555", channelSource: "REFERRAL", status: "INTERESTED", notes: null, daysAgoAdded: 11, followUpOffsetDays: 3 },
  { businessName: "דפוס נובה", contactName: "משה גבאי", phone: "053-444-6666", channelSource: "WEBSITE_FORM", status: "INTERESTED", notes: null, daysAgoAdded: 15, followUpOffsetDays: 1 },
  { businessName: "פיזיותרפיה ביי-וויו", contactName: null, phone: "054-555-7777", channelSource: "MANUAL_OUTREACH", status: "INTERESTED", notes: null, daysAgoAdded: 20, followUpOffsetDays: null },

  // MEETING_SCHEDULED
  { businessName: "בלூוייב לוגיסטיקה", contactName: "דני כהן", phone: "050-666-8888", channelSource: "WEBSITE_FORM", status: "MEETING_SCHEDULED", notes: null, daysAgoAdded: 4, followUpOffsetDays: 3 },
  { businessName: "אורכיד ספא ובריאות", contactName: "מאיה בן חמו", phone: "052-777-9999", channelSource: "WHATSAPP_INQUIRY", status: "MEETING_SCHEDULED", notes: null, daysAgoAdded: 13, followUpOffsetDays: 6 },

  // PROPOSAL_SENT
  { businessName: "אורלי דיזיין פנים", contactName: "אורלי בן דוד", phone: "053-888-0000", channelSource: "REFERRAL", status: "PROPOSAL_SENT", notes: "מחכה להצעת מחיר לשיפוץ המשרד.", daysAgoAdded: 2, followUpOffsetDays: 1 },
  { businessName: "פאלקון שילוח ותובלה", contactName: "עידן פלג", phone: "054-999-1111", channelSource: "WEBSITE_FORM", status: "PROPOSAL_SENT", notes: null, daysAgoAdded: 7, followUpOffsetDays: 2 },

  // CLOSED_WON
  { businessName: "משרד עו\"ד כץ ושות'", contactName: "עו\"ד שירה כץ", phone: "050-000-2222", channelSource: "REFERRAL", status: "CLOSED_WON", notes: "חתמו על התוכנית השנתית.", daysAgoAdded: 22, followUpOffsetDays: null, closedDaysAgo: 3 },
  { businessName: "גולדן גייט נדל\"ן", contactName: "אבי גולדשטיין", phone: "052-111-4444", channelSource: "WEBSITE_FORM", status: "CLOSED_WON", notes: null, daysAgoAdded: 28, followUpOffsetDays: null, closedDaysAgo: 8 },
  { businessName: "מרפאת שיניים פנינה", contactName: "ד\"ר רון פנחסי", phone: "053-222-5555", channelSource: "WHATSAPP_INQUIRY", status: "CLOSED_WON", notes: null, daysAgoAdded: 30, followUpOffsetDays: null, closedDaysAgo: 12 },
  { businessName: "סקייליין אדריכלים", contactName: "נועה שריד", phone: "054-333-6666", channelSource: "MANUAL_OUTREACH", status: "CLOSED_WON", notes: null, daysAgoAdded: 35, followUpOffsetDays: null, closedDaysAgo: 20 },

  // CLOSED_LOST
  { businessName: "קפה פיינווד", contactName: "בר כתריאל", phone: "050-444-7777", channelSource: "OTHER", status: "CLOSED_LOST", notes: "בחרו במתחרה.", daysAgoAdded: 26, followUpOffsetDays: null, closedDaysAgo: 10 },
];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

function buildDemoLeads(now: Date): LeadModel[] {
  return SEEDS.map((seed, i) => ({
    id: `demo-${i}`,
    businessName: seed.businessName,
    contactName: seed.contactName,
    phone: seed.phone,
    channelSource: seed.channelSource,
    status: seed.status,
    notes: seed.notes,
    nextFollowUp: seed.followUpOffsetDays === null ? null : addDays(now, seed.followUpOffsetDays),
    dateAdded: addDays(now, -seed.daysAgoAdded),
    updatedAt: addDays(now, -seed.daysAgoAdded),
    closedAt: seed.closedDaysAgo === undefined ? null : addDays(now, -seed.closedDaysAgo),
  })) as LeadModel[];
}

export interface RecentLeadItem {
  id: string;
  businessName: string;
  dateAdded: Date;
}

export interface DemoDashboardData {
  stats: DashboardStats;
  timeline: LeadsAddedPoint[];
  distribution: { status: LeadStatus; count: number }[];
  recent: RecentLeadItem[];
}

export function getDemoDashboardData(now = new Date()): DemoDashboardData {
  const leads = buildDemoLeads(now);
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
  const stats: DashboardStats = { totalLeads: leads.length, hotLeads, closedThisMonth, dueToday, overdue };

  const days = 30;
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (days - 1));
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) counts.set(toISODate(addDays(start, i)), 0);
  for (const lead of leads) {
    const key = toISODate(lead.dateAdded);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const timeline: LeadsAddedPoint[] = Array.from(counts.entries()).map(([date, count]) => ({ date, count }));

  const distribution = getDemoStatusDistribution(leads);

  const recent: RecentLeadItem[] = [...leads]
    .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime())
    .slice(0, 5)
    .map((l) => ({ id: l.id, businessName: l.businessName, dateAdded: l.dateAdded }));

  return { stats, timeline, distribution, recent };
}

function getDemoStatusDistribution(leads: LeadModel[]): { status: LeadStatus; count: number }[] {
  const counts = new Map<LeadStatus, number>(LEAD_STATUSES.map((s) => [s, 0]));
  for (const lead of leads) {
    const status = lead.status as LeadStatus;
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return LEAD_STATUSES.map((status) => ({ status, count: counts.get(status) ?? 0 }));
}

export interface DemoLeadsPageData {
  leads: LeadModel[];
  distribution: { status: LeadStatus; count: number }[];
  totalCount: number;
  hotLeads: number;
}

export function getDemoLeadsPageData(
  now: Date,
  options: { sortBy: LeadSortKey; sortDir: "asc" | "desc"; filter: LeadFilter; query?: string },
): DemoLeadsPageData {
  const allLeads = buildDemoLeads(now);
  const distribution = getDemoStatusDistribution(allLeads);

  const q = options.query?.trim().toLowerCase();
  let filtered = q
    ? allLeads.filter(
        (l) =>
          l.businessName.toLowerCase().includes(q) || (l.contactName ?? "").toLowerCase().includes(q),
      )
    : allLeads;

  if (options.filter === "needs_follow_up") {
    filtered = filtered.filter(
      (l) => needsFollowUpNow(l.nextFollowUp, now) && !CLOSED_STATUSES.includes(l.status as LeadStatus),
    );
  }

  const dir = options.sortDir === "asc" ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (options.sortBy === "status") {
      const rank = (status: string) => {
        const i = LEAD_STATUSES.indexOf(status as LeadStatus);
        return i === -1 ? LEAD_STATUSES.length : i;
      };
      return (rank(a.status) - rank(b.status)) * dir;
    }
    const av = a[options.sortBy] as Date | null;
    const bv = b[options.sortBy] as Date | null;
    const at = av ? av.getTime() : dir === 1 ? Infinity : -Infinity;
    const bt = bv ? bv.getTime() : dir === 1 ? Infinity : -Infinity;
    return (at - bt) * dir;
  });

  const hotLeads = allLeads.filter(
    (l) => needsFollowUpNow(l.nextFollowUp, now) && !CLOSED_STATUSES.includes(l.status as LeadStatus),
  ).length;

  return { leads: sorted, distribution, totalCount: allLeads.length, hotLeads };
}
