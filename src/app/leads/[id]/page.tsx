import { notFound } from "next/navigation";
import { getLeadById } from "@/lib/leads";
import { updateLeadAction } from "@/app/actions/leads";
import { LeadForm } from "@/components/LeadForm";
import { ActivityForm } from "@/components/ActivityForm";
import { StatusBadge } from "@/components/StatusBadge";
import { FollowUpStatus } from "@/components/FollowUpStatus";
import { DeleteLeadButton } from "@/components/DeleteLeadButton";
import {
  ACTIVITY_TYPE_LABELS,
  type ActivityType,
  type ChannelSource,
  type LeadStatus,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";

const CLOSED_STATUSES: LeadStatus[] = ["CLOSED_WON", "CLOSED_LOST"];

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
    <div className="mx-auto flex max-w-xl flex-col gap-10">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold">{lead.businessName}</h1>
          <DeleteLeadButton leadId={lead.id} businessName={lead.businessName} />
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <span className="text-border">·</span>
          <FollowUpStatus date={lead.nextFollowUp} closed={closed} />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted">Details</h2>
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
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-muted">Log activity</h2>
        <ActivityForm leadId={lead.id} leadName={lead.businessName} />
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-muted">History</h2>
        {lead.activities.length === 0 ? (
          <p className="text-sm text-muted">No activity logged yet.</p>
        ) : (
          <ol className="flex flex-col">
            {lead.activities.map((activity) => (
              <li key={activity.id} className="border-b border-border/70 py-3 first:pt-0 last:border-b-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-foreground/90">
                    {ACTIVITY_TYPE_LABELS[activity.type as ActivityType] ?? activity.type}
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {formatDateTime(activity.createdAt)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">
                  {activity.content}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
