import type { LeadsAddedPoint } from "@/lib/leads";

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 140;
const BAR_GAP = 3;

/**
 * The one chart on the dashboard: leads added per day, last 30 days.
 * A plain inline SVG bar chart — no charting library, no gridlines.
 * Per-bar <title> gives a hover tooltip with zero JS.
 */
export function LeadsAddedChart({ data }: { data: LeadsAddedPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = VIEW_WIDTH / data.length - BAR_GAP;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-36 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={`Leads added over the last ${data.length} days`}
    >
      {data.map((point, i) => {
        const barHeight = point.count === 0 ? 3 : Math.max(6, (point.count / max) * (VIEW_HEIGHT - 6));
        const x = i * (barWidth + BAR_GAP);
        const y = VIEW_HEIGHT - barHeight;
        return (
          <rect
            key={point.date}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={Math.min(4, barWidth / 2)}
            fill={point.count > 0 ? "var(--primary)" : "var(--border)"}
          >
            <title>{`${point.date}: ${point.count} lead${point.count === 1 ? "" : "s"}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
