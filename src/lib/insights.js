// Pure derivations for the Insights page — compute real metrics from the
// stores/inventory + transfers data already loaded into the app.
// No Supabase calls here (those live in App / the services layer); this is
// just math over the in-memory shapes.

const HEALTH_COLOR = "#16a34a";
const BALANCE_COLOR = "#f59e0b";
const EFFICIENCY_COLOR = "#2563eb";

// How far above reorder counts as "too much" stock (excess inventory).
const EXCESS_MULTIPLIER = 3;

function toPct(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function isLowStock(item) {
  return item.qty < item.reorder;
}

export function isExcessStock(item) {
  return item.reorder > 0 && item.qty > item.reorder * EXCESS_MULTIPLIER;
}

// "Balanced" = stocked at/above reorder but not piling up excess.
function isBalanced(item) {
  return !isLowStock(item) && !isExcessStock(item);
}

const storesWithInventory = (stores) => stores.filter((s) => s.inventory.length > 0);

/**
 * Returns the three Insights metric tiles, each in the shape InsightsTab
 * expects: { label, value, color, trend, hint }. `trend` is a real per-store
 * breakdown of the metric (not a time series — Supabase has no history).
 */
export function computeInsightMetrics(stores, transfers) {
  const lines = stores.flatMap((s) => s.inventory);

  // 1. Inventory Health — share of lines at or above reorder level.
  const healthScore = toPct(lines.filter((i) => !isLowStock(i)).length, lines.length);
  const healthByStore = storesWithInventory(stores).map((s) =>
    toPct(s.inventory.filter((i) => !isLowStock(i)).length, s.inventory.length)
  );

  // 2. Inventory Balance — share of lines that are neither low nor excessive.
  const balanceScore = toPct(lines.filter(isBalanced).length, lines.length);
  const balanceByStore = storesWithInventory(stores).map((s) =>
    toPct(s.inventory.filter(isBalanced).length, s.inventory.length)
  );

  // 3. Transfer Efficiency — share of transfers fully reconciled (completed).
  const reconciled = transfers.filter((t) => t.status === "Reconciled").length;
  const efficiencyScore = toPct(reconciled, transfers.length);
  const efficiencyByStore = stores
    .map((s) => {
      const outbound = transfers.filter((t) => t.from === s.name);
      if (outbound.length === 0) return null;
      return toPct(outbound.filter((t) => t.status === "Reconciled").length, outbound.length);
    })
    .filter((v) => v !== null);

  return [
    {
      label: "Inventory health",
      value: `${healthScore}%`,
      color: HEALTH_COLOR,
      tone: "ok",
      trend: healthByStore,
      hint: "Healthy stock by store",
    },
    {
      label: "Inventory balance",
      value: `${balanceScore}%`,
      color: BALANCE_COLOR,
      tone: "warn",
      trend: balanceByStore,
      hint: "Balanced stock by store",
    },
    {
      label: "Transfer efficiency",
      value: `${efficiencyScore}%`,
      color: EFFICIENCY_COLOR,
      tone: "accent",
      trend: efficiencyByStore,
      hint: "Completed by store",
    },
  ];
}

/**
 * Inventory risk alerts derived from live inventory. A line below its reorder
 * level is a stockout risk; a line stocked well above it (see EXCESS_MULTIPLIER)
 * is excess inventory. Stockout risks are surfaced first.
 */
export function generateRiskAlerts(stores) {
  const alerts = [];

  stores.forEach((store) => {
    store.inventory.forEach((item) => {
      if (isLowStock(item)) {
        alerts.push({
          id: `${store.name}-${item.sku}-low`,
          product: item.name,
          store: store.name,
          type: "Stockout risk",
          severity: "danger",
          detail: `${store.name} — ${item.qty} units, below reorder of ${item.reorder}`,
          magnitude: item.reorder - item.qty,
        });
      } else if (isExcessStock(item)) {
        alerts.push({
          id: `${store.name}-${item.sku}-excess`,
          product: item.name,
          store: store.name,
          type: "Excess inventory",
          severity: "warn",
          detail: `${store.name} — ${item.qty} units, ${item.qty - item.reorder} above reorder level`,
          magnitude: item.qty - item.reorder,
        });
      }
    });
  });

  // Stockout risks first, then by how far off target each line is.
  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "danger" ? -1 : 1;
    return b.magnitude - a.magnitude;
  });
}
