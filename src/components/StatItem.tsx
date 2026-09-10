import { cn } from "@/lib/utils";

/** A single number with a label. Deliberately unstyled beyond typography —
 * no card, no shadow, no icon. Lets the numbers speak, per design brief. */
export function StatItem({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <div className={cn("text-3xl font-semibold tabular-nums", accent && "text-hot")}>
        {value}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}
