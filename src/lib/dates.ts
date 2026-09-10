export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return dateFormatter.format(date);
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "—";
  return dateTimeFormatter.format(date);
}

/** Short, relative label for a follow-up date, e.g. "Today", "3d overdue", "In 5d". */
export function formatFollowUp(date: Date | null | undefined, now = new Date()): string {
  if (!date) return "No follow-up set";
  const diff = daysBetween(now, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday (overdue)";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  return `In ${diff}d — ${formatDate(date)}`;
}

export function isOverdue(date: Date | null | undefined, now = new Date()): boolean {
  if (!date) return false;
  return startOfDay(date) < startOfDay(now);
}

export function isDueToday(date: Date | null | undefined, now = new Date()): boolean {
  if (!date) return false;
  return isSameDay(date, now);
}

/** Due today or already overdue — the leads that need attention now. */
export function needsFollowUpNow(date: Date | null | undefined, now = new Date()): boolean {
  return isOverdue(date, now) || isDueToday(date, now);
}
