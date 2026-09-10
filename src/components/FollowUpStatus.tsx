import { formatFollowUp, needsFollowUpNow } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * Renders a lead's next follow-up date. Turns orange — the app's one
 * "hot lead" signal color — only when it's due today or overdue on an
 * open lead. Never decorative elsewhere.
 */
export function FollowUpStatus({
  date,
  closed = false,
  className,
}: {
  date: Date | null;
  closed?: boolean;
  className?: string;
}) {
  const hot = !closed && needsFollowUpNow(date);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        hot ? "text-hot" : "text-muted",
        className,
      )}
    >
      {hot && <span className="size-1.5 shrink-0 rounded-full bg-hot" aria-hidden />}
      {formatFollowUp(date)}
    </span>
  );
}
