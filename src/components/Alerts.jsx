import EmptyState from "./EmptyState";

export default function Alerts({ stores }) {
  const lowItems = [];
  stores.forEach((store) => {
    store.inventory.forEach((it) => {
      if (it.qty < it.reorder) lowItems.push({ ...it, store: store.name });
    });
  });

  return (
    <div className="alerts">
      {lowItems.length === 0 && (
        <EmptyState
          title="No stock alerts"
          message="Every store is at or above its reorder level. Imbalances will show up here as stock runs low."
        />
      )}
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
