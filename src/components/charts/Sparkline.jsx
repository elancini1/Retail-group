import { useId } from "react";

export default function Sparkline({ data, width = 160, height = 46, color = "var(--accent)" }) {
  const gradientId = useId();
  if (!data || data.length < 2) return null;

  const pad = 5; // vertical breathing room so peaks/troughs aren't clipped
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const usableH = height - pad * 2;

  const points = data.map((d, i) => {
    const x = (i * step).toFixed(1);
    const y = (pad + usableH - ((d - min) / range) * usableH).toFixed(1);
    return `${x},${y}`;
  });
  const line = points.join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

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
    </svg>
  );
}
