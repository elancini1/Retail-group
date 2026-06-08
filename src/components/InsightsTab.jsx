import Sparkline from "./charts/Sparkline";

export default function InsightsTab({ insights }) {
  return (
    <>
      <section className="summary-row">
        {insights.metrics.map((metric) => (
          <div key={metric.label} className="stat-card">
            <div className="stat-label">{metric.label}</div>
            <div className="stat-value">{metric.value}</div>
            {metric.trend && (
              <Sparkline data={metric.trend} color={metric.color} width={180} height={40} />
            )}
            <div className="stat-note">Last 8 weeks · AI-powered score</div>
          </div>
        ))}
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>AI recommendations</h3>
            <p className="muted">Suggested inventory moves based on forecasted demand.</p>
          </div>
        </div>

        <div className="recommendations-grid">
          {insights.recommendations.map((item) => (
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
          ))}
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>Inventory risk alerts</h3>
            <p className="muted">Monitor products that need immediate action or rebalancing.</p>
          </div>
        </div>

        <div className="risk-alerts-list">
          {insights.alerts.map((alert) => (
            <div key={alert.product} className="risk-alert">
              <div>
                <strong>{alert.product}</strong>
                <div className="muted">{alert.detail}</div>
              </div>
              <span className="alert-pill">{alert.type}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>AI assistant</h3>
            <p className="muted">Example questions and mock responses from your inventory advisor.</p>
          </div>
        </div>

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
