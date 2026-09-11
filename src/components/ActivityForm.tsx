import { addActivityAction } from "@/app/actions/leads";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS, type ActivityType } from "@/lib/constants";
import { BUTTON_PRIMARY } from "@/lib/styles";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-foreground/90";

type LeadOption = { id: string; businessName: string };

export function ActivityForm({
  leads,
  leadId,
  leadName,
  defaultType = "NOTE",
  submitLabel = "רישום פעילות",
}: {
  leads?: LeadOption[];
  leadId?: string;
  leadName?: string;
  defaultType?: ActivityType;
  submitLabel?: string;
}) {
  return (
    <form action={addActivityAction} className="flex flex-col gap-4">
      {leads ? (
        <div>
          <label htmlFor="leadId" className={LABEL_CLASS}>
            ליד
          </label>
          <select id="leadId" name="leadId" required className={INPUT_CLASS} defaultValue="">
            <option value="" disabled>
              בחירת ליד…
            </option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.businessName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <input type="hidden" name="leadId" value={leadId} />
          {leadName && (
            <p className="text-sm text-muted">
              עבור <span className="text-foreground">{leadName}</span>
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="type" className={LABEL_CLASS}>
          סוג
        </label>
        <select id="type" name="type" required defaultValue={defaultType} className={INPUT_CLASS}>
          {ACTIVITY_TYPES.filter((t) => t !== "STATUS_CHANGE").map((type) => (
            <option key={type} value={type}>
              {ACTIVITY_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className={LABEL_CLASS}>
          פרטים
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={4}
          className={INPUT_CLASS}
          placeholder="מה קרה?"
        />
      </div>

      <div>
        <button type="submit" className={BUTTON_PRIMARY}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
