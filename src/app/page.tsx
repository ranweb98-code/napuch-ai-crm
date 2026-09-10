import Link from "next/link";
import { getDashboardStats, getLeadsAddedTimeline, followUpStatusLine } from "@/lib/leads";
import { StatItem } from "@/components/StatItem";
import { LeadsAddedChart } from "@/components/LeadsAddedChart";
import { EmptyState } from "@/components/EmptyState";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "@/lib/styles";

// This page reads live data through Prisma (not `fetch`), which Next.js
// can't see as "dynamic" on its own — without this it would be prerendered
// once at build time and never reflect new leads or follow-ups.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (stats.totalLeads === 0) {
    return (
      <EmptyState
        title="No leads yet"
        description="Start tracking your pipeline for Napuch AI — add the first business you're talking to."
        actionHref="/leads/new"
        actionLabel="Add your first lead"
      />
    );
  }

  const timeline = await getLeadsAddedTimeline(30);

  return (
    <div className="flex flex-col gap-10">
      <p className="text-lg">{followUpStatusLine(stats)}</p>

      <div className="grid grid-cols-3 gap-6 sm:max-w-sm">
        <StatItem label="Total leads" value={stats.totalLeads} />
        <StatItem label="Hot leads" value={stats.hotLeads} accent={stats.hotLeads > 0} />
        <StatItem label="Closed this month" value={stats.closedThisMonth} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted">Leads added — last 30 days</h2>
        <LeadsAddedChart data={timeline} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/leads/new" className={BUTTON_PRIMARY}>
          Add Lead
        </Link>
        <Link href="/activity/new?type=NOTE" className={BUTTON_SECONDARY}>
          Add Note
        </Link>
        <Link href="/activity/new" className={BUTTON_SECONDARY}>
          Log Activity
        </Link>
      </div>
    </div>
  );
}
