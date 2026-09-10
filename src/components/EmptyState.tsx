import Link from "next/link";
import { BUTTON_PRIMARY } from "@/lib/styles";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className={`mt-2 ${BUTTON_PRIMARY}`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
