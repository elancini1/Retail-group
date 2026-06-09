// Generate simple transfer recommendations from live store inventory data.
// This helper stays beginner-friendly and uses only the existing store item
// shape: { sku, name, qty, reorder }.

const LOW_STOCK_LABEL = "Low stock";

function isLowStock(item) {
  return (
    item &&
    typeof item.qty === "number" &&
    typeof item.reorder === "number" &&
    item.qty < item.reorder
  );
}

function calculateSurplus(item) {
  if (!item || typeof item.qty !== "number" || typeof item.reorder !== "number") {
    return 0;
  }

  return Math.max(0, item.qty - item.reorder);
}

function buildConfidence(qty, reorder) {
  if (reorder <= 0) {
    return "Medium";
  }

  const ratio = qty / reorder;
  if (ratio >= 1) {
    return "High";
  }
  if (ratio >= 0.5) {
    return "Medium";
  }
  return "Low";
}

function buildImpact(qty, reorder) {
  if (reorder <= 0) {
    return "Reduce stockout risk.";
  }

  const percent = Math.min(99, Math.round((qty / reorder) * 100));
  return `Reduce stockout risk by ${percent}%`;
}

function calculateBuffer(reorder) {
  return Math.max(2, Math.round(reorder * 0.25));
}

function createRecommendation(source, destination, item, transferQty) {
  return {
    title: `Transfer ${transferQty} ${item.name} from ${source.name} to ${destination.name}`,
    impact: buildImpact(transferQty, item.reorder),
    confidence: buildConfidence(transferQty, item.reorder),
    action: transferQty >= item.reorder ? "Approve transfer" : "Review recommendation",
    from: source.name,
    to: destination.name,
    product: item.name,
    qty: transferQty,
  };
}

export function generateRecommendations(stores) {
  if (!Array.isArray(stores)) {
    return [];
  }

  const inventoryBySku = new Map();

  stores.forEach((store) => {
    const inventory = Array.isArray(store.inventory) ? store.inventory : [];

    inventory.forEach((item) => {
      if (!item || !item.sku) {
        return;
      }

      const rows = inventoryBySku.get(item.sku) || [];
      rows.push({ store, item });
      inventoryBySku.set(item.sku, rows);
    });
  });

  const recommendations = [];

  inventoryBySku.forEach((rows) => {
    if (rows.length < 2) {
      return;
    }

    const lowStockRows = rows
      .filter((entry) => isLowStock(entry.item))
      .map((entry) => {
        const buffer = calculateBuffer(entry.item.reorder);
        const targetQty = entry.item.reorder + buffer;
        const deficit = targetQty - entry.item.qty;

        return {
          ...entry,
          buffer,
          targetQty,
          deficit,
        };
      })
      .filter((entry) => entry.deficit > 0)
      .sort((a, b) => b.deficit - a.deficit);

    const surplusRows = rows
      .map((entry) => ({
        ...entry,
        surplus: calculateSurplus(entry.item),
      }))
      .filter((entry) => entry.surplus > 0)
      .sort((a, b) => b.surplus - a.surplus);

    lowStockRows.forEach((lowRow) => {
      const sourceRow = surplusRows.find((entry) => entry.store.id !== lowRow.store.id && entry.surplus > 0);
      if (!sourceRow) {
        return;
      }

      const transferQty = Math.min(lowRow.deficit, sourceRow.surplus);
      if (transferQty <= 0) {
        return;
      }

      sourceRow.surplus -= transferQty;
      recommendations.push(createRecommendation(sourceRow.store, lowRow.store, lowRow.item, transferQty));
    });
  });

  return recommendations;
}
