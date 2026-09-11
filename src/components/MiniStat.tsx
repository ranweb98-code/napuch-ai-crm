import { cn } from "@/lib/utils";

const TINTS = {
  neutral: "bg-border/60 text-foreground",
  primary: "bg-primary-tint text-primary-text",
  warning: "bg-warning-tint text-warning",
  success: "bg-success-tint text-success",
} as const;

export function MiniStat({
  label,
  value,
  tint = "neutral",
}: {
  label: string;
  value: string | number;
  tint?: keyof typeof TINTS;
}) {
  return (
    <div className={cn("flex flex-col gap-1 rounded-2xl px-5 py-4", TINTS[tint])}>
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-sm font-medium opacity-80">{label}</span>
    </div>
  );
}
