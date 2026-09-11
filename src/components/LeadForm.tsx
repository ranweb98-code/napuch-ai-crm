import {
  CHANNEL_SOURCES,
  CHANNEL_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type ChannelSource,
  type LeadStatus,
} from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { BUTTON_PRIMARY } from "@/lib/styles";

const INPUT_CLASS =
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-text focus:outline-none focus:ring-1 focus:ring-primary-text";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-foreground/90";

export interface LeadFormValues {
  businessName: string;
  contactName: string | null;
  phone: string | null;
  channelSource: ChannelSource;
  status: LeadStatus;
  notes: string | null;
  nextFollowUp: Date | null;
  dateAdded?: Date;
}

export function LeadForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<LeadFormValues>;
  submitLabel: string;
}) {
  const toDateInputValue = (date: Date | null | undefined) =>
    date ? date.toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="businessName" className={LABEL_CLASS}>
            שם העסק
          </label>
          <input
            id="businessName"
            name="businessName"
            required
            defaultValue={defaultValues?.businessName}
            className={INPUT_CLASS}
            placeholder="חברת דוגמה בע״מ"
          />
        </div>
        <div>
          <label htmlFor="contactName" className={LABEL_CLASS}>
            איש קשר
          </label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={defaultValues?.contactName ?? ""}
            className={INPUT_CLASS}
            placeholder="ישראל ישראלי"
          />
        </div>
        <div>
          <label htmlFor="phone" className={LABEL_CLASS}>
            טלפון
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultValues?.phone ?? ""}
            className={INPUT_CLASS}
            placeholder="050-000-0000"
          />
        </div>
        <div>
          <label htmlFor="channelSource" className={LABEL_CLASS}>
            ערוץ הגעה
          </label>
          <select
            id="channelSource"
            name="channelSource"
            required
            defaultValue={defaultValues?.channelSource ?? "MANUAL_OUTREACH"}
            className={INPUT_CLASS}
          >
            {CHANNEL_SOURCES.map((source) => (
              <option key={source} value={source}>
                {CHANNEL_SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={LABEL_CLASS}>
            סטטוס
          </label>
          <select
            id="status"
            name="status"
            required
            defaultValue={defaultValues?.status ?? "NEW"}
            className={INPUT_CLASS}
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nextFollowUp" className={LABEL_CLASS}>
            מעקב הבא
          </label>
          <input
            id="nextFollowUp"
            name="nextFollowUp"
            type="date"
            defaultValue={toDateInputValue(defaultValues?.nextFollowUp)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={LABEL_CLASS}>
          הערות
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          className={INPUT_CLASS}
          placeholder="הקשר, נקודות כאב, כל מה ששווה לזכור..."
        />
      </div>

      {defaultValues?.dateAdded && (
        <p className="text-sm text-muted">נוסף בתאריך {formatDate(defaultValues.dateAdded)}</p>
      )}

      <div>
        <button type="submit" className={BUTTON_PRIMARY}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
