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
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const LABEL_CLASS = "mb-1.5 block text-sm font-medium text-foreground/90";

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
            Business name
          </label>
          <input
            id="businessName"
            name="businessName"
            required
            defaultValue={defaultValues?.businessName}
            className={INPUT_CLASS}
            placeholder="Acme Inc."
          />
        </div>
        <div>
          <label htmlFor="contactName" className={LABEL_CLASS}>
            Contact person
          </label>
          <input
            id="contactName"
            name="contactName"
            defaultValue={defaultValues?.contactName ?? ""}
            className={INPUT_CLASS}
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label htmlFor="phone" className={LABEL_CLASS}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaultValues?.phone ?? ""}
            className={INPUT_CLASS}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label htmlFor="channelSource" className={LABEL_CLASS}>
            Channel source
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
            Status
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
            Next follow-up
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
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaultValues?.notes ?? ""}
          className={INPUT_CLASS}
          placeholder="Context, pain points, anything worth remembering..."
        />
      </div>

      {defaultValues?.dateAdded && (
        <p className="text-sm text-muted">Added {formatDate(defaultValues.dateAdded)}</p>
      )}

      <div>
        <button type="submit" className={BUTTON_PRIMARY}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
