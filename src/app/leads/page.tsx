import Link from "next/link";
import { Search } from "lucide-react";
import {
  getLeads,
  getStatusDistribution,
  getDashboardStats,
  type LeadSortKey,
  type LeadFilter,
} from "@/lib/leads";
import { LeadRow } from "@/components/LeadRow";
import { EmptyState } from "@/components/EmptyState";
import { MiniStat } from "@/components/MiniStat";
import { BUTTON_PRIMARY } from "@/lib/styles";
import { cn } from "@/lib/utils";

function isSortKey(value: string | undefined): value is LeadSortKey {
  return value === "status" || value === "nextFollowUp" || value === "dateAdded";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; filter?: string; q?: string }>;
}) {
  const params = await searchParams;
  const sortBy = isSortKey(params.sort) ? params.sort : "nextFollowUp";
  const sortDir = params.dir === "desc" ? "desc" : "asc";
  const filter: LeadFilter = params.filter === "needs_follow_up" ? "needs_follow_up" : "all";
  const q = params.q?.trim() ?? "";

  const distribution = await getStatusDistribution();
  const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);

  if (totalCount === 0) {
    return (
      <EmptyState
        title="No leads yet"
        description="Add your first lead to start building your pipeline."
        actionHref="/leads/new"
        actionLabel="Add your first lead"
      />
    );
  }

  const [leads, dashboardStats] = await Promise.all([
    getLeads({ sortBy, sortDir, filter, query: q }),
    getDashboardStats(),
  ]);

  const byStatus = (status: string) => distribution.find((d) => d.status === status)?.count ?? 0;
  const inProgressCount =
    byStatus("CONTACTED") + byStatus("INTERESTED") + byStatus("MEETING_SCHEDULED") + byStatus("PROPOSAL_SENT");
  const closedCount = byStatus("CLOSED_WON") + byStatus("CLOSED_LOST");

  const sortLink = (key: LeadSortKey, label: string) => {
    const nextDir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    const active = sortBy === key;
    const qs = new URLSearchParams();
    qs.set("sort", key);
    qs.set("dir", nextDir);
    if (filter !== "all") qs.set("filter", filter);
    if (q) qs.set("q", q);
    return (
      <Link
        key={key}
        href={`/leads?${qs.toString()}`}
        className={cn("hover:text-foreground", active ? "text-foreground" : "text-muted")}
      >
        {label}
        {active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    );
  };

  const filterHref = (f: LeadFilter) => {
    const qs = new URLSearchParams();
    qs.set("sort", sortBy);
    qs.set("dir", sortDir);
    if (f !== "all") qs.set("filter", f);
    if (q) qs.set("q", q);
    return `/leads?${qs.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
        <Link href="/leads/new" className={BUTTON_PRIMARY}>
          Add Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="New" value={byStatus("NEW")} tint="primary" />
        <MiniStat label="In progress" value={inProgressCount} tint="warning" />
        <MiniStat label="Needs follow-up" value={dashboardStats.hotLeads} tint="warning" />
        <MiniStat label="Closed" value={closedCount} tint="success" />
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <form action="/leads" method="GET" className="relative w-full sm:max-w-xs">
          <input type="hidden" name="sort" value={sortBy} />
          <input type="hidden" name="dir" value={sortDir} />
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search leads…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link
            href={filterHref("all")}
            className={cn("hover:text-foreground", filter === "all" ? "font-semibold text-foreground" : "text-muted")}
          >
            All ({totalCount})
          </Link>
          <Link
            href={filterHref("needs_follow_up")}
            className={cn(
              "hover:text-foreground",
              filter === "needs_follow_up" ? "font-semibold text-warning" : "text-muted",
            )}
          >
            Needs follow-up
          </Link>
          <span className="hidden text-border sm:inline">|</span>
          <span className="text-muted">Sort:</span>
          {sortLink("nextFollowUp", "Follow-up")}
          {sortLink("status", "Status")}
          {sortLink("dateAdded", "Date added")}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:flex sm:items-center">
          <div className="sm:flex-1">Business</div>
          <div className="sm:w-28 sm:shrink-0">Phone</div>
          <div className="sm:w-36 sm:shrink-0">Channel</div>
          <div className="sm:w-40 sm:shrink-0">Status</div>
          <div className="sm:w-32 sm:shrink-0 sm:text-right">Follow-up</div>
        </div>

        {leads.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">
            No leads match{q ? ` "${q}"` : " this filter"}.
          </p>
        ) : (
          leads.map((lead) => <LeadRow key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
