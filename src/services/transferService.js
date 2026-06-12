// Transfer data access (Supabase): reads the transfer history and persists
// approvals / status changes.
import { supabase } from "../supabase";

// Render Supabase `created_at` like the rest of the UI (e.g. "Jun 8, 2026").
export function formatTransferDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Loads transfers joined with product/store names, one row per line item:
 * [{ id, product, from, to, qty, status, date }]. Throws on failure so callers
 * can fall back to seed data.
 */
export async function getTransfers() {
  const [transfersRes, itemsRes, productsRes, storesRes] = await Promise.all([
    supabase.from("transfers").select("id, from_store_id, to_store_id, status, created_at"),
    supabase.from("transfer_items").select("transfer_id, product_id, quantity"),
    supabase.from("products").select("id, name"),
    supabase.from("stores").select("id, name"),
  ]);

  const failed =
    transfersRes.error || itemsRes.error || productsRes.error || storesRes.error ||
    !transfersRes.data || !itemsRes.data || !productsRes.data || !storesRes.data;
  if (failed) {
    throw new Error("Failed to load transfers.");
  }

  const productById = Object.fromEntries(productsRes.data.map((p) => [p.id, p]));
  const storeById = Object.fromEntries(storesRes.data.map((s) => [s.id, s]));

  const mapped = [];
  for (const transfer of transfersRes.data) {
    const items = itemsRes.data.filter((item) => item.transfer_id === transfer.id);
    for (const item of items) {
      const product = productById[item.product_id];
      const fromStore = storeById[transfer.from_store_id];
      const toStore = storeById[transfer.to_store_id];
      mapped.push({
        id: transfer.id,
        product: product?.name || "Unknown",
        from: fromStore?.name || "Unknown",
        to: toStore?.name || "Unknown",
        qty: item.quantity,
        status: transfer.status,
        date: formatTransferDate(transfer.created_at),
      });
    }
  }

  return mapped;
}

/**
 * Inserts a transfer and its single line item. If the line-item insert fails,
 * the transfer row is rolled back. Returns the new transfer id; throws on error.
 */
export async function createTransfer({ fromStoreId, toStoreId, productId, qty }) {
  const transferId = crypto.randomUUID();

  const { error: transferError } = await supabase.from("transfers").insert([
    {
      id: transferId,
      from_store_id: fromStoreId,
      to_store_id: toStoreId,
      status: "Approved",
      created_at: new Date().toISOString(),
    },
  ]);

  if (transferError) {
    throw new Error(transferError.message || "Failed to save transfer.");
  }

  const { error: itemError } = await supabase.from("transfer_items").insert([
    {
      id: crypto.randomUUID(),
      transfer_id: transferId,
      product_id: productId,
      quantity: qty,
    },
  ]);

  if (itemError) {
    await supabase.from("transfers").delete().eq("id", transferId);
    throw new Error(itemError.message || "Failed to save transfer item.");
  }

  return transferId;
}

export async function updateTransferStatus(transferId, status) {
  const { error } = await supabase.from("transfers").update({ status }).eq("id", transferId);
  if (error) {
    throw new Error(error.message || "Failed to update transfer status.");
  }
}
