import Link from "next/link";
import { Search } from "lucide-react";
import { getLeads, getStatusDistribution, getDashboardStats, type LeadSortKey, type LeadFilter } from "@/lib/leads";
import { getDemoLeadsPageData } from "@/lib/demoData";
import { LeadRow } from "@/components/LeadRow";
import { MiniStat } from "@/components/MiniStat";
import { BUTTON_PRIMARY } from "@/lib/styles";
import { cn } from "@/lib/utils";

function isSortKey(value: string | undefined): value is LeadSortKey {
  return value === "status" || value === "nextFollowUp" || value === "dateAdded";
}

type QueryOptions = { sortBy: LeadSortKey; sortDir: "asc" | "desc"; filter: LeadFilter; query: string };

async function loadLeadsPageData(
  isDemo: boolean,
  realDistribution: Awaited<ReturnType<typeof getStatusDistribution>>,
  options: QueryOptions,
) {
  if (isDemo) return getDemoLeadsPageData(new Date(), options);

  const [leads, dashboardStats] = await Promise.all([getLeads(options), getDashboardStats()]);
  const totalCount = realDistribution.reduce((sum, d) => sum + d.count, 0);
  return { leads, distribution: realDistribution, totalCount, hotLeads: dashboardStats.hotLeads };
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

  const realDistribution = await getStatusDistribution();
  const isDemo = realDistribution.reduce((sum, d) => sum + d.count, 0) === 0;

  const { leads, distribution, totalCount, hotLeads } = await loadLeadsPageData(isDemo, realDistribution, {
    sortBy,
    sortDir,
    filter,
    query: q,
  });

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
        <div>
          <h1 className="font-display text-gradient-animate text-4xl font-black tracking-tight sm:text-5xl">
            לידים
          </h1>
          <span className="shine-bar mt-2 block h-1.5 w-16 rounded-full" aria-hidden="true" />
        </div>
        <Link href="/leads/new" className={BUTTON_PRIMARY}>
          הוספת ליד
        </Link>
      </div>
      {isDemo && <p className="-mt-4 text-sm text-muted">נתוני דוגמה — הוסף/הוסיפי ליד ראשון כדי להתחיל.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
          <MiniStat label="חדש" value={byStatus("NEW")} tint="primary" />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "70ms" }}>
          <MiniStat label="בתהליך" value={inProgressCount} tint="warning" />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "140ms" }}>
          <MiniStat label="דורש מעקב" value={hotLeads} tint="warning" />
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "210ms" }}>
          <MiniStat label="נסגר" value={closedCount} tint="success" />
        </div>
      </div>

      <div
        className="card animate-fade-up flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: "260ms" }}
      >
        <form action="/leads" method="GET" className="relative w-full sm:max-w-xs">
          <input type="hidden" name="sort" value={sortBy} />
          <input type="hidden" name="dir" value={sortDir} />
          {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
          <Search
            size={16}
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="חיפוש לידים…"
            className="w-full rounded-xl border border-border bg-background py-2.5 ps-10 pe-3 text-sm placeholder:text-muted focus:border-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text"
          />
        </form>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link
            href={filterHref("all")}
            className={cn("hover:text-foreground", filter === "all" ? "font-semibold text-foreground" : "text-muted")}
          >
            הכל ({totalCount})
          </Link>
          <Link
            href={filterHref("needs_follow_up")}
            className={cn(
              "hover:text-foreground",
              filter === "needs_follow_up" ? "font-semibold text-warning" : "text-muted",
            )}
          >
            דורש מעקב
          </Link>
          <span className="hidden text-border sm:inline">|</span>
          <span className="text-muted">מיון:</span>
          {sortLink("nextFollowUp", "מעקב")}
          {sortLink("status", "סטטוס")}
          {sortLink("dateAdded", "תאריך הוספה")}
        </div>
      </div>

      <div className="card animate-fade-up overflow-hidden" style={{ animationDelay: "320ms" }}>
        <div className="hidden gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted sm:flex sm:items-center">
          <div className="sm:flex-1">עסק</div>
          <div className="sm:w-28 sm:shrink-0">טלפון</div>
          <div className="sm:w-36 sm:shrink-0">ערוץ</div>
          <div className="sm:w-40 sm:shrink-0">סטטוס</div>
          <div className="sm:w-32 sm:shrink-0 sm:text-end">מעקב</div>
        </div>

        {leads.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">
            לא נמצאו לידים{q ? ` עבור "${q}"` : " התואמים את הסינון"}.
          </p>
        ) : (
          leads.map((lead) => <LeadRow key={lead.id} lead={lead} demo={isDemo} />)
        )}
      </div>
    </div>
  );
}
