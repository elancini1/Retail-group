// A modern KPI tile: tinted icon chip, display-size value, label, optional trend + chart.
// `tone` drives the accent color: "accent" | "ok" | "warn" | "danger" | "neutral".
export default function MetricTile({ icon: Icon, label, value, hint, tone = "accent", trend, chart }) {
  return (
    <div className={`metric-tile tone-${tone}`}>
      <div className="tile-top">
        <span className="tile-icon">{Icon && <Icon size={18} />}</span>
        {trend && (
          <span className={`tile-trend ${trend.dir}`}>
            {trend.icon && <trend.icon />}
            {trend.label}
          </span>
        )}
      </div>
      <div className="tile-value">{value}</div>
      <div className="tile-label">{label}</div>
      {hint && <div className="tile-hint">{hint}</div>}
      {chart && <div className="tile-chart">{chart}</div>}
    </div>
  );
}
