import type { DashboardStats, LeadsAddedPoint } from "@/lib/leads";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants";
import { startOfDay } from "@/lib/dates";

/**
 * Cosmetic-only sample data for the dashboard's empty state. Nothing here
 * touches the database — it exists purely so a brand-new account (zero
 * leads) still renders the full stat-card/chart/table layout instead of a
 * bare "no leads" message. The moment a real lead is added, `DashboardPage`
 * switches to `getDashboardStats()` et al. and this module is never called.
 */

export interface RecentLeadItem {
  id: string;
  businessName: string;
  dateAdded: Date;
}

const DEMO_STATS: DashboardStats = {
  totalLeads: 47,
  hotLeads: 6,
  closedThisMonth: 5,
  dueToday: 3,
  overdue: 2,
};

// Leads added per day, oldest → newest, last 30 days. Hand-authored (not
// random) so the chart/sparkline/delta tell one consistent "trending up"
// story instead of reshuffling on every request.
const DEMO_TIMELINE_COUNTS = [
  0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 2, 1, 1, 0, 2, 2, 1, 2, 1, 3, 1, 2, 3, 3,
];

const DEMO_STATUS_COUNTS: Record<LeadStatus, number> = {
  NEW: 9,
  CONTACTED: 11,
  INTERESTED: 7,
  MEETING_SCHEDULED: 4,
  PROPOSAL_SENT: 3,
  CLOSED_WON: 9,
  CLOSED_LOST: 4,
};

const DEMO_RECENT_BUSINESS_NAMES = [
  "Orly Interiors",
  "BlueWave Logistics",
  "Kfar Saba Dental",
  "Northgate Realty",
  "Solara Fitness",
];

export interface DemoDashboardData {
  stats: DashboardStats;
  timeline: LeadsAddedPoint[];
  distribution: { status: LeadStatus; count: number }[];
  recent: RecentLeadItem[];
}

export function getDemoDashboardData(now = new Date()): DemoDashboardData {
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (DEMO_TIMELINE_COUNTS.length - 1));

  const timeline: LeadsAddedPoint[] = DEMO_TIMELINE_COUNTS.map((count, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), count };
  });

  const distribution = LEAD_STATUSES.map((status) => ({
    status,
    count: DEMO_STATUS_COUNTS[status],
  }));

  const recent: RecentLeadItem[] = DEMO_RECENT_BUSINESS_NAMES.map((businessName, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    return { id: `demo-${i}`, businessName, dateAdded: d };
  });

  return { stats: DEMO_STATS, timeline, distribution, recent };
}
