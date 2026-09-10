import { getLeads } from "@/lib/leads";
import { ActivityForm } from "@/components/ActivityForm";
import { EmptyState } from "@/components/EmptyState";
import { isActivityType, type ActivityType } from "@/lib/constants";

export const metadata = { title: "Log activity — Napuch AI CRM" };

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; leadId?: string }>;
}) {
  const params = await searchParams;
  const defaultType: ActivityType = isActivityType(params.type ?? "") ? (params.type as ActivityType) : "NOTE";

  const leads = await getLeads({ sortBy: "dateAdded", sortDir: "desc" });

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads yet"
        description="Add a lead first, then you can log notes and activity against it."
        actionHref="/leads/new"
        actionLabel="Add your first lead"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">
        {defaultType === "NOTE" ? "Add note" : "Log activity"}
      </h1>
      <div className="card p-6">
        <ActivityForm
          leads={leads.map((l) => ({ id: l.id, businessName: l.businessName }))}
          defaultType={defaultType}
          submitLabel={defaultType === "NOTE" ? "Add note" : "Log activity"}
        />
      </div>
    </div>
  );
}
