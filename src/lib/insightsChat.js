// Generate dynamic chat responses for the Insights chat.
// The questions stay fixed, but answers adapt to live data from stores,
// transfers, metrics, alerts, and recommendations.

/**
 * Find the store with the lowest inventory balance or health score.
 * This store is our "weakest" performer.
 */
function findWeakestStore(stores, metrics) {
  if (!stores || stores.length === 0) return null;

  // Try to find "Inventory balance" metric to identify weak stores
  const balanceMetric = metrics?.find((m) => m.label === "Inventory balance");
  if (balanceMetric && balanceMetric.trend && balanceMetric.trend.length > 0) {
    // Find the store with the lowest balance score
    const minScore = Math.min(...balanceMetric.trend);
    const minIndex = balanceMetric.trend.indexOf(minScore);
    if (minIndex >= 0 && minIndex < stores.length) {
      return { store: stores[minIndex], score: minScore };
    }
  }

  // Fallback: pick store with most low-stock items
  let weakestStore = null;
  let maxLowStockCount = -1;

  stores.forEach((store) => {
    if (!store.inventory) return;
    const lowStockCount = store.inventory.filter((item) => item.qty < item.reorder).length;
    if (lowStockCount > maxLowStockCount) {
      maxLowStockCount = lowStockCount;
      weakestStore = store;
    }
  });

  return weakestStore ? { store: weakestStore, score: null } : null;
}

/**
 * Extract top 1-2 stockout risk alerts.
 * Filter for "Stockout risk" severity and return the most critical ones.
 */
function getTopStockoutRisks(alerts) {
  if (!Array.isArray(alerts)) return [];

  // Find "Stockout risk" alerts (danger severity is highest)
  const stockoutRisks = alerts.filter((a) => a.severity === "danger" || a.type === "Stockout risk");

  // Sort by magnitude (how far below reorder) — highest first
  stockoutRisks.sort((a, b) => (b.magnitude || 0) - (a.magnitude || 0));

  // Return top 1–2
  return stockoutRisks.slice(0, 2);
}

/**
 * Extract top 1-2 transfer recommendations.
 * Sort by confidence and impact.
 */
function getTopRecommendations(recommendations) {
  if (!Array.isArray(recommendations)) return [];

  // Simple sort: "High" confidence first, then "Medium"
  const sorted = [...recommendations].sort((a, b) => {
    const confidenceOrder = { High: 0, Medium: 1, Low: 2 };
    const aConf = confidenceOrder[a.confidence] ?? 2;
    const bConf = confidenceOrder[b.confidence] ?? 2;
    return aConf - bConf;
  });

  return sorted.slice(0, 2);
}

/**
 * Generate a short, human-readable answer for store performance.
 */
function generateStorePerformanceAnswer(stores, metrics) {
  const weakest = findWeakestStore(stores, metrics);

  if (!weakest || !weakest.store) {
    return "All stores are performing well with balanced inventory.";
  }

  const { store } = weakest;
  const lowStockItems = store.inventory?.filter((item) => item.qty < item.reorder) || [];

  if (lowStockItems.length === 0) {
    return `${store.name} is performing adequately with healthy stock levels.`;
  }

  const topLowItem = lowStockItems[0];
  return `${store.name} is struggling with low inventory. "${topLowItem.name}" has only ${topLowItem.qty} units (needs ${topLowItem.reorder}).`;
}

/**
 * Generate a short, human-readable answer for stockout risks.
 */
function generateStockoutRiskAnswer(alerts) {
  const topRisks = getTopStockoutRisks(alerts);

  if (topRisks.length === 0) {
    return "No critical stockout risks detected. Inventory levels are healthy.";
  }

  if (topRisks.length === 1) {
    const risk = topRisks[0];
    return `"${risk.product}" at ${risk.store} is at highest risk. Current stock: ${risk.detail.split("—")[1]?.trim() || "low"}.`;
  }

  // Two risks
  const risk1 = topRisks[0];
  const risk2 = topRisks[1];
  return `"${risk1.product}" at ${risk1.store} and "${risk2.product}" at ${risk2.store} are at highest risk.`;
}

/**
 * Generate a short, human-readable answer for priority transfers.
 */
function generateTransferPriorityAnswer(recommendations) {
  const topRecs = getTopRecommendations(recommendations);

  if (topRecs.length === 0) {
    return "No urgent transfers needed right now. Inventory is well-distributed.";
  }

  if (topRecs.length === 1) {
    const rec = topRecs[0];
    return `Prioritize: Move ${rec.qty} "${rec.product}" from ${rec.from} to ${rec.to}. Impact: ${rec.impact}.`;
  }

  // Two recommendations
  const rec1 = topRecs[0];
  const rec2 = topRecs[1];
  return `Top priorities: (1) Move ${rec1.qty} "${rec1.product}" to ${rec1.to}, (2) Move ${rec2.qty} "${rec2.product}" to ${rec2.to}.`;
}

/**
 * Generate the dynamic chat for the Insights page.
 *
 * @param {Array} stores - Array of store objects with inventory
 * @param {Array} transfers - Array of transfer objects
 * @param {Array} metrics - Array of metric objects (from computeInsightMetrics)
 * @param {Array} alerts - Array of alert objects (from generateRiskAlerts)
 * @param {Array} recommendations - Array of recommendation objects (from generateRecommendations)
 * @returns {Array} Array of { question, answer } objects
 */
export function generateInsightChat(stores = [], metrics = [], alerts = [], recommendations = []) {
  return [
    {
      question: "How is the weakest store performing this week?",
      answer: generateStorePerformanceAnswer(stores, metrics),
    },
    {
      question: "Which products are at risk of stockout?",
      answer: generateStockoutRiskAnswer(alerts),
    },
    {
      question: "What transfers should I prioritize?",
      answer: generateTransferPriorityAnswer(recommendations),
    },
  ];
}
