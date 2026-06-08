export default function DonutChart({
  value,
  size = 132,
  stroke = 14,
  color = "var(--accent)",
  trackColor = "var(--surface-inset)",
  label,
}) {
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const center = size / 2;

  return (
    <div className="donut">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label || "Value"}: ${Math.round(pct)} percent`}
      >
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="donut-value">
          {Math.round(pct)}%
        </text>
      </svg>
      {label && <div className="donut-label">{label}</div>}
    </div>
  );
}
