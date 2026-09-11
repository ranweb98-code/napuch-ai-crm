import Link from "next/link";
import {
  Users,
  Flame,
  Trophy,
  CalendarClock,
  UserPlus,
  StickyNote,
  ClipboardList,
} from "lucide-react";
import {
  getDashboardStats,
  getLeadsAddedTimeline,
  getStatusDistribution,
  getRecentLeads,
  followUpStatusLine,
  type DashboardStats,
} from "@/lib/leads";
import { getDemoDashboardData, type RecentLeadItem } from "@/lib/demoDashboard";
import { StatCard } from "@/components/StatCard";
import { LeadsAddedChart } from "@/components/LeadsAddedChart";
import { DonutChart } from "@/components/DonutChart";
import { Avatar } from "@/components/Avatar";
import { formatDate } from "@/lib/dates";

// This page reads live data through Prisma (not `fetch`), which Next.js
// can't see as "dynamic" on its own — without this it would be prerendered
// once at build time and never reflect new leads or follow-ups.
export const dynamic = "force-dynamic";

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  { href: "/leads/new", label: "Add Lead", icon: UserPlus },
  { href: "/activity/new?type=NOTE", label: "Add Note", icon: StickyNote },
  { href: "/activity/new", label: "Log Activity", icon: ClipboardList },
];

async function loadDashboardData(isDemo: boolean, realStats: DashboardStats) {
  if (isDemo) return getDemoDashboardData();

  const [timeline, distribution, recent] = await Promise.all([
    getLeadsAddedTimeline(30),
    getStatusDistribution(),
    getRecentLeads(5),
  ]);
  return { stats: realStats, timeline, distribution, recent: recent as RecentLeadItem[] };
}

export default async function DashboardPage() {
  const realStats = await getDashboardStats();
  const isDemo = realStats.totalLeads === 0;
  const { stats, timeline, distribution, recent } = await loadDashboardData(isDemo, realStats);

  const last7 = timeline.slice(-7).reduce((sum, p) => sum + p.count, 0);
  const prev7 = timeline.slice(-14, -7).reduce((sum, p) => sum + p.count, 0);
  const delta =
    prev7 === 0
      ? last7 > 0
        ? { value: "New this week", direction: "up" as const }
        : null
      : {
          value: `${Math.abs(Math.round(((last7 - prev7) / prev7) * 100))}%`,
          direction: last7 >= prev7 ? ("up" as const) : ("down" as const),
        };

  const byStatus = (status: string) => distribution.find((d) => d.status === status)?.count ?? 0;
  const inProgress =
    byStatus("CONTACTED") + byStatus("INTERESTED") + byStatus("MEETING_SCHEDULED") + byStatus("PROPOSAL_SENT");
  const donutSegments = [
    { label: "New", value: byStatus("NEW"), color: "var(--chart-2)" },
    { label: "In progress", value: inProgress, color: "var(--primary)" },
    { label: "Won", value: byStatus("CLOSED_WON"), color: "var(--success)" },
    { label: "Lost", value: byStatus("CLOSED_LOST"), color: "var(--danger)" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="font-display text-gradient-animate">{greeting(new Date())}</span>{" "}
          <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 text-muted">
          {isDemo ? "Sample data — add your first lead to get started." : followUpStatusLine(stats)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
          <StatCard
            label="Total leads"
            value={stats.totalLeads}
            icon={Users}
            delta={delta}
            sparkline={timeline.slice(-14).map((p) => p.count)}
            variant="hero"
          />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "70ms" }}>
          <StatCard label="Hot leads" value={stats.hotLeads} icon={Flame} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "140ms" }}>
          <StatCard label="Closed this month" value={stats.closedThisMonth} icon={Trophy} />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "210ms" }}>
          <StatCard label="Due today" value={stats.dueToday} icon={CalendarClock} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="card animate-fade-up p-5 lg:col-span-3" style={{ animationDelay: "280ms" }}>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Leads added — last 30 days</h2>
          <LeadsAddedChart data={timeline} />
        </div>
        <div className="card animate-fade-up p-5 lg:col-span-2" style={{ animationDelay: "340ms" }}>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Pipeline breakdown</h2>
          <DonutChart segments={donutSegments} />
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {stats.overdue > 0 ? `${stats.overdue} lead${stats.overdue === 1 ? "" : "s"} overdue` : "Recent leads"}
          </h2>
          <Link href="/leads" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="flex flex-wrap gap-5">
          {recent.map((lead) => {
            const content = (
              <>
                <Avatar name={lead.businessName} />
                <span className="max-w-20 truncate text-xs font-medium text-foreground">
                  {lead.businessName}
                </span>
                <span className="text-[11px] text-muted">{formatDate(lead.dateAdded)}</span>
              </>
            );
            return isDemo ? (
              <div key={lead.id} className="flex flex-col items-center gap-2 text-center">
                {content}
              </div>
            ) : (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex flex-col items-center gap-2 text-center"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="grid grid-cols-3 gap-4 sm:max-w-md">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card flex flex-col items-center gap-2 py-5 text-center transition-transform hover:scale-[1.03]"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-white">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
