import { getLeads } from "@/lib/leads";
import { ActivityForm } from "@/components/ActivityForm";
import { EmptyState } from "@/components/EmptyState";
import { isActivityType, type ActivityType } from "@/lib/constants";

export const metadata = { title: "רישום פעילות — Napuch AI CRM" };

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
        title="עדיין אין לידים"
        description="הוסף/הוסיפי קודם ליד, ואז אפשר יהיה לרשום עליו הערות ופעילות."
        actionHref="/leads/new"
        actionLabel="הוספת ליד ראשון"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl font-black tracking-tight">
        {defaultType === "NOTE" ? "הוספת הערה" : "רישום פעילות"}
      </h1>
      <div className="card p-6">
        <ActivityForm
          leads={leads.map((l) => ({ id: l.id, businessName: l.businessName }))}
          defaultType={defaultType}
          submitLabel={defaultType === "NOTE" ? "הוספת הערה" : "רישום פעילות"}
        />
      </div>
    </div>
  );
}
