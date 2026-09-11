"use client";

import { deleteLeadAction } from "@/app/actions/leads";

export function DeleteLeadButton({ leadId, businessName }: { leadId: string; businessName: string }) {
  const boundDelete = deleteLeadAction.bind(null, leadId);

  return (
    <form
      action={boundDelete}
      onSubmit={(e) => {
        if (!confirm(`למחוק את ${businessName}? לא ניתן לבטל פעולה זו.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-sm font-medium text-muted transition-colors hover:text-danger">
        מחיקת ליד
      </button>
    </form>
  );
}
