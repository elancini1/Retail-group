export default function BarChart({ data, height = 150 }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="bar-chart" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="bar-col">
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${(d.value / max) * 100}%`, background: d.color || "var(--accent)" }}
              title={`${d.label}: ${d.value}`}
            />
          </div>
          <div className="bar-value">{d.value}</div>
          <div className="bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
