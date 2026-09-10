import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-primary-tint text-primary",
  "bg-success-tint text-success",
  "bg-warning-tint text-warning",
  "bg-info-tint text-info",
  "bg-danger-tint text-danger",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        colorFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
