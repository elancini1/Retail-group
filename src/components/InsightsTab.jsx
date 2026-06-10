import Sparkline from "./charts/Sparkline";
import MetricTile from "./MetricTile";
import SectionHeader from "./SectionHeader";
import { TransferIcon, HeartPulseIcon, ChartBarsIcon, SparkIcon, AlertIcon, ChatIcon } from "./icons/Icons";

const METRIC_ICONS = {
  "Inventory health": HeartPulseIcon,
  "Inventory balance": ChartBarsIcon,
  "Transfer efficiency": TransferIcon,
};

export default function InsightsTab({ insights }) {
  return (
    <>
      <section className="dash-tiles">
        {insights.metrics.map((metric) => (
          <MetricTile
            key={metric.label}
            icon={METRIC_ICONS[metric.label] || SparkIcon}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            tone={metric.tone || "accent"}
            chart={
              metric.trend && metric.trend.length >= 2 ? (
                <Sparkline data={metric.trend} color={metric.color} />
              ) : undefined
            }
          />
        ))}
      </section>

      <section className="card section-card">
        <SectionHeader icon={SparkIcon} title="AI recommendations" subtitle="Suggested inventory moves based on forecasted demand." />

        <div className="recommendations-grid">
          {insights.recommendations.length === 0 ? (
            <div className="recommendation-empty">
              <p className="muted">No recommendations right now.</p>
            </div>
          ) : (
            insights.recommendations.map((item) => (
              <div key={item.title} className="recommendation-card">
                <div className="recommendation-copy">
                  <strong>{item.title}</strong>
                  <p className="muted">Expected impact: {item.impact}</p>
                </div>
                <div className="recommendation-footer">
                  <span className="confidence-chip">{item.confidence} confidence</span>
                  <button type="button" className="btn recommendation-action">{item.action}</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card section-card">
        <SectionHeader icon={AlertIcon} title="Inventory risk alerts" subtitle="Products that need immediate action or rebalancing." />

        <div className="risk-alerts-list">
          {insights.alerts.length === 0 ? (
            <div className="recommendation-empty">
              <p className="muted">No risk alerts — inventory looks balanced.</p>
            </div>
          ) : (
            insights.alerts.map((alert) => (
              <div key={alert.id} className={`risk-alert risk-${alert.severity}`}>
                <div>
                  <strong>{alert.product}</strong>
                  <div className="muted">{alert.detail}</div>
                </div>
                <span className={`alert-pill alert-${alert.severity}`}>{alert.type}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card section-card">
        <SectionHeader icon={ChatIcon} title="AI assistant" subtitle="Example questions and mock responses from your inventory advisor." />

        <div className="ai-chat-card">
          {insights.chat.map((entry) => (
            <div key={entry.question} className="chat-pair">
              <div className="chat-bubble chat-user">{entry.question}</div>
              <div className="chat-bubble chat-assistant">{entry.answer}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
