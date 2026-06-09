import { useId } from "react";

export default function Sparkline({ data, width = 160, height = 46, color = "var(--accent)" }) {
  const gradientId = useId();
  if (!data || data.length < 2) return null;

  const pad = 5; // vertical breathing room so peaks/troughs aren't clipped
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const step = width / (data.length - 1);
  const usableH = height - pad * 2;

  // When every value is equal, center the line instead of pinning it to the floor.
  const yFor = (d) => (range === 0 ? height / 2 : pad + usableH - ((d - min) / range) * usableH);

  const coords = data.map((d, i) => [Number((i * step).toFixed(1)), Number(yFor(d).toFixed(1))]);
  const line = coords.map((c) => c.join(",")).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="sparkline"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.24" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* current-value marker (degenerate round-capped line stays circular under non-uniform scaling) */}
      <line
        x1={lastX}
        y1={lastY}
        x2={lastX}
        y2={lastY}
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
