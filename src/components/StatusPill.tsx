import { LEAD_STATUS_LABELS, LEAD_STATUS_PILL_CLASS, type LeadStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = status as LeadStatus;
  const label = LEAD_STATUS_LABELS[key] ?? status;
  const pillClass = LEAD_STATUS_PILL_CLASS[key] ?? "bg-border text-muted";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        pillClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
