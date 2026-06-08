import StoreOverview from "./StoreOverview";
import Alerts from "./Alerts";
import DonutChart from "./charts/DonutChart";
import ProgressBar from "./charts/ProgressBar";
import MetricTile from "./MetricTile";
import SectionHeader from "./SectionHeader";
import { StoreIcon, BoxIcon, AlertIcon, HeartPulseIcon } from "./icons/Icons";

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
  const healthColor =
    healthyPct >= 80 ? "var(--success)" : healthyPct >= 50 ? "var(--warning)" : "var(--danger)";

  const storeUnits = stores.map((store) => ({
    name: store.name,
    units: store.inventory.reduce((sum, item) => sum + item.qty, 0),
  }));
  const maxStoreUnits = Math.max(1, ...storeUnits.map((s) => s.units));

  return (
    <>
      <section className="dash-tiles">
        <MetricTile icon={StoreIcon} label="Active stores" value={stores.length} hint="Locations tracked" tone="accent" />
        <MetricTile icon={BoxIcon} label="Units in stock" value={totalUnits} hint="Across all stores" tone="neutral" />
        <MetricTile
          icon={AlertIcon}
          label="Low stock"
          value={lowAlerts}
          hint={lowAlerts > 0 ? "Need attention" : "All healthy"}
          tone={lowAlerts > 0 ? "danger" : "ok"}
        />
      </section>

      <section className="card hero-health">
        <SectionHeader icon={HeartPulseIcon} title="Inventory health" subtitle="Share of items at or above their reorder level." />
        <div className="stock-health">
          <DonutChart value={healthyPct} color={healthColor} label="Healthy stock" />
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

      <div className="dash-two">
        <section className="card">
          <SectionHeader icon={StoreIcon} title="Store overview" subtitle="Stock levels at a glance." />
          <StoreOverview stores={stores} />
        </section>

        <section className="card">
          <SectionHeader icon={AlertIcon} title="Stock imbalance alerts" subtitle="Transfers that resolve gaps." />
          <Alerts stores={stores} />
        </section>
      </div>
    </>
  );
}
