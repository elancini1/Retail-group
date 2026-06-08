import EmptyState from "./EmptyState";

function StoreCard({ store }) {
  const total = store.inventory.reduce((s, i) => s + i.qty, 0);
  const low = store.inventory.filter((i) => i.qty < i.reorder).length;

  return (
    <div className="store-card">
      <h3>{store.name}</h3>
      <p>{store.location}</p>
      <div className="store-metrics">
        <div>
          <div className="metric-number">{total}</div>
          <div className="muted">Total units tracked</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={`low-count ${low > 0 ? "low" : "ok"}`}>{low} low</div>
          <div className="muted">Low-stock items</div>
        </div>
      </div>
    </div>
  );
}

export default function StoreOverview({ stores }) {
  if (stores.length === 0) {
    return (
      <EmptyState
        title="No stores yet"
        message="Add a store to start tracking inventory and stock levels across locations."
      />
    );
  }

  return (
    <div>
      <div className="store-cards">
        {stores.map((s) => (
          <StoreCard key={s.id} store={s} />
        ))}
      </div>
    </div>
  );
}
