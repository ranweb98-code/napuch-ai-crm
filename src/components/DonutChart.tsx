export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const RADIUS = 42;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const arcs = segments.reduce<{ segment: DonutSegment; dash: number; offset: number }[]>(
    (acc, segment) => {
      const previous = acc[acc.length - 1];
      const cumulative = previous ? previous.offset + previous.dash : 0;
      const dash = (segment.value / total) * CIRCUMFERENCE;
      acc.push({ segment, dash, offset: cumulative });
      return acc;
    },
    [],
  );

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <svg viewBox="0 0 100 100" className="size-40 -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {arcs.map(({ segment, dash, offset }) => (
          <circle
            key={segment.label}
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={segment.color}
            strokeWidth={STROKE}
            strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap={segments.length > 1 ? "butt" : "round"}
          />
        ))}
      </svg>

      <ul className="flex w-full flex-col gap-2.5 sm:w-auto">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-muted">{segment.label}</span>
            <span className="ml-auto font-semibold sm:ml-4">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
