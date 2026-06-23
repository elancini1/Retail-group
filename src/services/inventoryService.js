// Inventory + product data access (Supabase). Low-level table reads used by
// storeService to assemble the stores-with-inventory snapshot.
import { supabase } from "../supabase";

const PRODUCT_COLUMNS = "id, sku, name, category";
const INVENTORY_COLUMNS = "id, store_id, product_id, quantity, reorder_level";

export function fetchProducts() {
  return supabase.from("products").select(PRODUCT_COLUMNS);
}

export function fetchInventory() {
  return supabase.from("inventory").select(INVENTORY_COLUMNS);
}

/**
 * Apply transfer items to origin/destination inventories.
 * - items: [{ product_id, quantity }]
 * - Subtracts from `fromStoreId`, adds to `toStoreId`.
 * - Creates inventory rows when missing, preserving reorder_level when present.
 * - Attempts to rollback partial changes if an intermediate step fails.
 */
export async function applyTransferReconciliation(fromStoreId, toStoreId, items) {
  if (!items || items.length === 0) return;

  // record applied deltas for rollback in case of failure
  const applied = [];

  try {
    for (const item of items) {
      const productId = item.product_id;
      const qty = Number(item.quantity) || 0;

      // Origin: subtract qty
      const originRes = await supabase
        .from("inventory")
        .select(INVENTORY_COLUMNS)
        .match({ store_id: fromStoreId, product_id: productId })
        .maybeSingle();

      if (originRes.error) throw new Error(originRes.error.message || "Failed reading origin inventory");

      if (originRes.data) {
        const newQty = Number(originRes.data.quantity || 0) - qty;
        const upd = await supabase.from("inventory").update({ quantity: newQty }).eq("id", originRes.data.id);
        if (upd.error) throw new Error(upd.error.message || "Failed updating origin inventory");
        applied.push({ store_id: fromStoreId, product_id: productId, delta: +qty }); // reverse would add qty back
      } else {
        // create a row with negative or zero-starting quantity
        const insert = await supabase.from("inventory").insert([
          { store_id: fromStoreId, product_id: productId, quantity: 0 - qty, reorder_level: 0 },
        ]);
        if (insert.error) throw new Error(insert.error.message || "Failed inserting origin inventory");
        applied.push({ store_id: fromStoreId, product_id: productId, delta: +qty });
      }

      // Destination: add qty
      const destRes = await supabase
        .from("inventory")
        .select(INVENTORY_COLUMNS)
        .match({ store_id: toStoreId, product_id: productId })
        .maybeSingle();

      if (destRes.error) throw new Error(destRes.error.message || "Failed reading destination inventory");

      if (destRes.data) {
        const newQty = Number(destRes.data.quantity || 0) + qty;
        const upd = await supabase.from("inventory").update({ quantity: newQty }).eq("id", destRes.data.id);
        if (upd.error) throw new Error(upd.error.message || "Failed updating destination inventory");
        applied.push({ store_id: toStoreId, product_id: productId, delta: -qty }); // reverse would subtract qty
      } else {
        const insert = await supabase.from("inventory").insert([
          { store_id: toStoreId, product_id: productId, quantity: qty, reorder_level: 0 },
        ]);
        if (insert.error) throw new Error(insert.error.message || "Failed inserting destination inventory");
        applied.push({ store_id: toStoreId, product_id: productId, delta: -qty });
      }
    }
  } catch (err) {
    // attempt best-effort rollback of applied changes
    const rollbackErrors = [];
    for (const a of applied.reverse()) {
      try {
        // find the inventory row
        const rowRes = await supabase
          .from("inventory")
          .select(INVENTORY_COLUMNS)
          .match({ store_id: a.store_id, product_id: a.product_id })
          .maybeSingle();

        if (rowRes.error) {
          rollbackErrors.push(rowRes.error.message || "unknown");
          continue;
        }

        if (!rowRes.data) {
          // nothing to rollback
          continue;
        }

        const newQty = Number(rowRes.data.quantity || 0) + a.delta;
        const upd = await supabase.from("inventory").update({ quantity: newQty }).eq("id", rowRes.data.id);
        if (upd.error) rollbackErrors.push(upd.error.message || "unknown");
      } catch (rollbackErr) {
        rollbackErrors.push(rollbackErr.message || String(rollbackErr));
      }
    }

    const rollbackMsg = rollbackErrors.length > 0 ? ` Rollback errors: ${rollbackErrors.join("; ")}` : "";
    throw new Error(`${err.message || String(err)}.${rollbackMsg}`);
  }
}
