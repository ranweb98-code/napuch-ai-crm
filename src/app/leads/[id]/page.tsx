import { notFound } from "next/navigation";
import { Phone, Mail, MessageCircle, Calendar, Repeat } from "lucide-react";
import { getLeadById } from "@/lib/leads";
import { updateLeadAction } from "@/app/actions/leads";
import { LeadForm } from "@/components/LeadForm";
import { ActivityForm } from "@/components/ActivityForm";
import { StatusPill } from "@/components/StatusPill";
import { FollowUpStatus } from "@/components/FollowUpStatus";
import { DeleteLeadButton } from "@/components/DeleteLeadButton";
import { Avatar } from "@/components/Avatar";
import {
  ACTIVITY_TYPE_LABELS,
  type ActivityType,
  type ChannelSource,
  type LeadStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

const ACTIVITY_ICON: Record<ActivityType, typeof Phone> = {
  NOTE: MessageCircle,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  STATUS_CHANGE: Repeat,
  OTHER: MessageCircle,
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) notFound();

  const closed = CLOSED_STATUSES.includes(lead.status as LeadStatus);
  const boundUpdate = updateLeadAction.bind(null, lead.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={lead.businessName} className="size-14 text-lg" />
          <div>
            <h1 className="text-xl font-bold">{lead.businessName}</h1>
            {lead.contactName && <p className="text-sm text-muted">{lead.contactName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
          <StatusPill status={lead.status} />
          <FollowUpStatus date={lead.nextFollowUp} closed={closed} />
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Details</h2>
          <DeleteLeadButton leadId={lead.id} businessName={lead.businessName} />
        </div>
        <LeadForm
          action={boundUpdate}
          submitLabel="Save changes"
          defaultValues={{
            businessName: lead.businessName,
            contactName: lead.contactName,
            phone: lead.phone,
            channelSource: lead.channelSource as ChannelSource,
            status: lead.status as LeadStatus,
            notes: lead.notes,
            nextFollowUp: lead.nextFollowUp,
            dateAdded: lead.dateAdded,
          }}
        />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Log activity</h2>
        <ActivityForm leadId={lead.id} leadName={lead.businessName} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-foreground">History</h2>
        {lead.activities.length === 0 ? (
          <p className="text-sm text-muted">No activity logged yet.</p>
        ) : (
          <ol className="flex flex-col">
            {lead.activities.map((activity) => {
              const Icon = ACTIVITY_ICON[activity.type as ActivityType] ?? MessageCircle;
              return (
                <li key={activity.id} className="flex gap-3 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      activity.type === "STATUS_CHANGE"
                        ? "bg-primary-tint text-primary"
                        : "bg-background text-muted",
                    )}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-semibold text-foreground">
                        {ACTIVITY_TYPE_LABELS[activity.type as ActivityType] ?? activity.type}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted">{activity.content}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
