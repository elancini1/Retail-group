import React from "react";

export default function TransferTracking({ transfers }) {
  const statusClass = (s) =>
    s === "Approved"
      ? "status-chip status-approved"
      : s === "In Transit"
      ? "status-chip status-in-transit"
      : "status-chip status-reconciled";

  return (
    <div className="card transfer-list">
      <h3>Transfer Tracking</h3>
      {transfers.map((t) => (
        <div key={t.id} className="transfer-row">
          <div>
            <strong>{t.product}</strong>
            <div className="muted">{t.from} → {t.to} • {t.qty} units</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className={statusClass(t.status)}>{t.status}</div>
            <div className="muted">ID #{t.id}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
