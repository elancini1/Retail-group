export default function ProgressBar({ value, max = 100, color = "var(--accent)", label, valueLabel }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="progress">
      {(label || valueLabel) && (
        <div className="progress-head">
          {label && <span>{label}</span>}
          {valueLabel && <span className="progress-value">{valueLabel}</span>}
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
