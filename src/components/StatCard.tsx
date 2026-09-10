import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(1, ...data);
  const w = 100;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * (h - 4) - 2}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  sparkline,
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: { value: string; direction: "up" | "down" } | null;
  sparkline?: number[];
  variant?: "default" | "hero";
}) {
  const hero = variant === "hero";

  return (
    <div
      className={cn(
        "card flex flex-col gap-4 p-5",
        hero && "bg-[image:var(--gradient-brand)] text-white",
      )}
    >
      <div className="flex items-start justify-between">
        <span className={cn("text-sm font-medium", hero ? "text-white/80" : "text-muted")}>{label}</span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            hero ? "bg-white/15" : "bg-primary-tint text-primary",
          )}
        >
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <span className="text-3xl font-bold tabular-nums">{value}</span>
        {delta && (
          <span
            className={cn(
              "mb-1 inline-flex items-center gap-0.5 text-xs font-semibold",
              hero
                ? "text-white/90"
                : delta.direction === "up"
                  ? "text-success"
                  : "text-danger",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight size={14} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={14} strokeWidth={2.5} />
            )}
            {delta.value}
          </span>
        )}
      </div>

      {sparkline && sparkline.length > 1 && (
        <Sparkline data={sparkline} color={hero ? "rgba(255,255,255,0.85)" : "var(--primary)"} />
      )}
    </div>
  );
}
