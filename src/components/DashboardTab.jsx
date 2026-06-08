import StoreOverview from "./StoreOverview";
import Alerts from "./Alerts";
import DonutChart from "./charts/DonutChart";
import ProgressBar from "./charts/ProgressBar";

export default function DashboardTab({ stores }) {
  const totalUnits = stores.reduce(
    (total, store) => total + store.inventory.reduce((sum, item) => sum + item.qty, 0),
    0
  );
  const lowAlerts = stores.reduce(
    (total, store) => total + store.inventory.filter((item) => item.qty < item.reorder).length,
    0
  );

  const totalItems = stores.reduce((total, store) => total + store.inventory.length, 0);
  const healthyPct = totalItems > 0 ? ((totalItems - lowAlerts) / totalItems) * 100 : 0;

  const storeUnits = stores.map((store) => ({
    name: store.name,
    units: store.inventory.reduce((sum, item) => sum + item.qty, 0),
  }));
  const maxStoreUnits = Math.max(1, ...storeUnits.map((s) => s.units));

  return (
    <>
      <section className="summary-row">
        <div className="stat-card">
          <div className="stat-label">Stores</div>
          <div className="stat-value">{stores.length}</div>
          <div className="stat-note">Active locations</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Inventory</div>
          <div className="stat-value">{totalUnits}</div>
          <div className="stat-note">Units tracked across stores</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low stock</div>
          <div className="stat-value">{lowAlerts}</div>
          <div className="stat-note">Items below reorder level</div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>Stock health</h3>
            <p className="muted">Share of tracked items at or above their reorder level.</p>
          </div>
        </div>
        <div className="stock-health">
          <DonutChart
            value={healthyPct}
            color={healthyPct >= 80 ? "var(--success)" : healthyPct >= 50 ? "var(--warning)" : "var(--danger)"}
            label="Healthy stock"
          />
          <div className="stock-health-bars">
            {storeUnits.map((store) => (
              <ProgressBar
                key={store.name}
                value={store.units}
                max={maxStoreUnits}
                label={store.name}
                valueLabel={`${store.units} units`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>Store overview</h3>
            <p className="muted">Track current stock levels and find low inventory at a glance.</p>
          </div>
        </div>
        <StoreOverview stores={stores} />
      </section>

      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>Stock imbalance alerts</h3>
            <p className="muted">Recommended transfers to resolve inventory gaps quickly.</p>
          </div>
        </div>
        <Alerts stores={stores} />
      </section>
    </>
  );
}
