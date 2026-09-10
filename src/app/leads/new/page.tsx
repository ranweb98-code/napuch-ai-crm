import { createLeadAction } from "@/app/actions/leads";
import { LeadForm } from "@/components/LeadForm";

export const metadata = { title: "Add lead — Napuch AI CRM" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Add lead</h1>
      <div className="card p-6">
        <LeadForm action={createLeadAction} submitLabel="Add lead" />
      </div>
    </div>
  );
}
