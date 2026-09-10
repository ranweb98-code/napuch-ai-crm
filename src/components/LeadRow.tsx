import Link from "next/link";
import type { LeadModel } from "@/generated/prisma/models";
import { CHANNEL_SOURCE_LABELS, type ChannelSource, type LeadStatus } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { FollowUpStatus } from "@/components/FollowUpStatus";

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

export function LeadRow({ lead }: { lead: LeadModel }) {
  const closed = CLOSED_STATUSES.includes(lead.status as LeadStatus);

  return (
    <Link
      href={`/leads/${lead.id}`}
      className="flex flex-col gap-1.5 border-b border-border/70 px-1 py-3 transition-colors hover:bg-surface/60 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5"
    >
      <div className="min-w-0 sm:flex-1">
        <div className="truncate font-medium">{lead.businessName}</div>
        {lead.contactName && (
          <div className="truncate text-sm text-muted">{lead.contactName}</div>
        )}
      </div>
      <div className="hidden text-sm text-muted sm:block sm:w-28 sm:shrink-0">
        {lead.phone || "—"}
      </div>
      <div className="hidden text-sm text-muted sm:block sm:w-36 sm:shrink-0">
        {CHANNEL_SOURCE_LABELS[lead.channelSource as ChannelSource] ?? lead.channelSource}
      </div>
      <div className="sm:w-36 sm:shrink-0">
        <StatusBadge status={lead.status} />
      </div>
      <div className="sm:w-32 sm:shrink-0 sm:text-right">
        <FollowUpStatus date={lead.nextFollowUp} closed={closed} className="sm:justify-end" />
      </div>
    </Link>
  );
}
