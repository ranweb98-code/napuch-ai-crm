import { createLeadAction } from "@/app/actions/leads";
import { LeadForm } from "@/components/LeadForm";

export const metadata = { title: "הוספת ליד — Napuch AI CRM" };

export default function NewLeadPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="font-display text-3xl font-black tracking-tight">הוספת ליד</h1>
      <div className="card p-6">
        <LeadForm action={createLeadAction} submitLabel="הוספת ליד" />
      </div>
    </div>
  );
}
