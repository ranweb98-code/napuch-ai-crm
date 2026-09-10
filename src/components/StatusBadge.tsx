import { LEAD_STATUS_LABELS, LEAD_STATUS_TEXT_CLASS, type LeadStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status as LeadStatus;
  const label = LEAD_STATUS_LABELS[key] ?? status;
  const textClass = LEAD_STATUS_TEXT_CLASS[key] ?? "text-foreground/70";

  return <span className={cn("text-sm", textClass, className)}>{label}</span>;
}
