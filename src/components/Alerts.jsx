import React from "react";

export default function Alerts({ stores }) {
  const lowItems = [];
  stores.forEach((store) => {
    store.inventory.forEach((it) => {
      if (it.qty < it.reorder) lowItems.push({ ...it, store: store.name });
    });
  });

  return (
    <div className="card alerts">
      <h3>Stock Imbalance Alerts</h3>
      {lowItems.length === 0 && <div className="muted">No alerts — all good.</div>}
      {lowItems.map((it) => (
        <div key={it.sku} className="alert-row">
          <div>
            <strong>{it.name}</strong>
            <div className="muted">{it.store} — {it.qty} units (reorder {it.reorder})</div>
          </div>
          <div className="low-count low">Low</div>
        </div>
      ))}
    </div>
  );
}
