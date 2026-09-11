import Link from "next/link";
import type { LeadModel } from "@/generated/prisma/models";
import { CHANNEL_SOURCE_LABELS, type ChannelSource, type LeadStatus } from "@/lib/constants";
import { StatusPill } from "@/components/StatusPill";
import { FollowUpStatus } from "@/components/FollowUpStatus";
import { Avatar } from "@/components/Avatar";

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

export function LeadRow({ lead, demo = false }: { lead: LeadModel; demo?: boolean }) {
  const closed = CLOSED_STATUSES.includes(lead.status as LeadStatus);
  const className =
    "flex flex-col gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:gap-4" +
    (demo ? "" : " hover:bg-background");

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3 sm:flex-1">
        <Avatar name={lead.businessName} className="size-9 text-xs sm:size-10 sm:text-sm" />
        <div className="min-w-0">
          <div className="truncate font-semibold">{lead.businessName}</div>
          {lead.contactName && <div className="truncate text-sm text-muted">{lead.contactName}</div>}
        </div>
      </div>
      <div className="hidden text-sm text-muted sm:block sm:w-28 sm:shrink-0">
        {lead.phone || "—"}
      </div>
      <div className="hidden text-sm text-muted sm:block sm:w-36 sm:shrink-0">
        {CHANNEL_SOURCE_LABELS[lead.channelSource as ChannelSource] ?? lead.channelSource}
      </div>
      <div className="sm:w-40 sm:shrink-0">
        <StatusPill status={lead.status} />
      </div>
      <div className="sm:w-32 sm:shrink-0 sm:text-end">
        <FollowUpStatus date={lead.nextFollowUp} closed={closed} className="sm:justify-end" />
      </div>
    </>
  );

  if (demo) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/leads/${lead.id}`} className={className}>
      {content}
    </Link>
  );
}
