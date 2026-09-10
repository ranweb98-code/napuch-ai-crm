import Link from "next/link";
import { getLeads, type LeadSortKey, type LeadFilter } from "@/lib/leads";
import { LeadRow } from "@/components/LeadRow";
import { EmptyState } from "@/components/EmptyState";
import { BUTTON_PRIMARY } from "@/lib/styles";
import { cn } from "@/lib/utils";

function isSortKey(value: string | undefined): value is LeadSortKey {
  return value === "status" || value === "nextFollowUp" || value === "dateAdded";
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const sortBy = isSortKey(params.sort) ? params.sort : "nextFollowUp";
  const sortDir = params.dir === "desc" ? "desc" : "asc";
  const filter: LeadFilter = params.filter === "needs_follow_up" ? "needs_follow_up" : "all";

  const [leads, allLeads] = await Promise.all([
    getLeads({ sortBy, sortDir, filter }),
    filter === "all" ? Promise.resolve(null) : getLeads({ filter: "all" }),
  ]);
  const totalCount = allLeads ? allLeads.length : leads.length;

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

  const sortLink = (key: LeadSortKey, label: string) => {
    const nextDir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    const active = sortBy === key;
    const href = `/leads?sort=${key}&dir=${nextDir}${filter !== "all" ? `&filter=${filter}` : ""}`;
    return (
      <Link
        key={key}
        href={href}
        className={cn("hover:text-foreground", active ? "text-foreground" : "text-muted")}
      >
        {label}
        {active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
      </Link>
    );
  };

  const filterHref = (f: LeadFilter) =>
    `/leads?sort=${sortBy}&dir=${sortDir}${f !== "all" ? `&filter=${f}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Leads</h1>
        <Link href="/leads/new" className={BUTTON_PRIMARY}>
          Add Lead
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
        <div className="flex gap-4">
          <Link
            href={filterHref("all")}
            className={cn("hover:text-foreground", filter === "all" ? "text-foreground" : "text-muted")}
          >
            All ({totalCount})
          </Link>
          <Link
            href={filterHref("needs_follow_up")}
            className={cn(
              "hover:text-foreground",
              filter === "needs_follow_up" ? "text-hot" : "text-muted",
            )}
          >
            Needs follow-up
          </Link>
        </div>
        <div className="flex gap-4">
          <span className="text-muted">Sort:</span>
          {sortLink("nextFollowUp", "Follow-up")}
          {sortLink("status", "Status")}
          {sortLink("dateAdded", "Date added")}
        </div>
      </div>

      {leads.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">
          No leads match this filter — you&apos;re all caught up.
        </p>
      ) : (
        <div>
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
