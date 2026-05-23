import React from "react";

export default function AIAssistant({ suggestions, onApprove }) {
  return (
    <div className="card ai-panel">
      <h3>AI Assistant</h3>
      <p className="muted">Suggestions to rebalance stock based on recent sales and inventory.</p>
      {suggestions.map((s, i) => (
        <div key={i} className="suggestion-row">
          <div>
            <strong>{s.product}</strong>
            <div className="muted">{s.qty} units • {s.from} → {s.to}</div>
          </div>
          <div>
            <button className="btn" onClick={() => onApprove(s)}>Approve</button>
          </div>
        </div>
      ))}
    </div>
  );
}
