// Store data access (Supabase). Composes stores + products + inventory into the
// nested shape the UI consumes: { id, name, location, active, inventory: [...] }.
import { supabase } from "../supabase";
import { fetchProducts, fetchInventory } from "./inventoryService";

const STORE_COLUMNS = "id, name, location, active";

export function fetchStores() {
  return supabase.from("stores").select(STORE_COLUMNS);
}

/**
 * Loads stores with their inventory plus name→id lookup maps.
 * Returns { stores, productNameToId, storeNameToId }.
 * Throws on failure; the Error carries `tableErrors` (["stores: ...", ...]) so
 * callers can show granular messages.
 */
export async function getStoresWithInventory() {
  const [storesRes, productsRes, inventoryRes] = await Promise.all([
    fetchStores(),
    fetchProducts(),
    fetchInventory(),
  ]);

  const tableErrors = [];
  if (storesRes.error) tableErrors.push(`stores: ${storesRes.error.message || JSON.stringify(storesRes.error)}`);
  if (productsRes.error) tableErrors.push(`products: ${productsRes.error.message || JSON.stringify(productsRes.error)}`);
  if (inventoryRes.error) tableErrors.push(`inventory: ${inventoryRes.error.message || JSON.stringify(inventoryRes.error)}`);

  if (tableErrors.length > 0 || !storesRes.data || !productsRes.data || !inventoryRes.data) {
    const error = new Error(tableErrors.join("; ") || "Live store data is incomplete.");
    error.tableErrors = tableErrors;
    throw error;
  }

  const productById = Object.fromEntries(productsRes.data.map((p) => [p.id, p]));

  const inventoryByStoreId = inventoryRes.data.reduce((acc, inv) => {
    const product = productById[inv.product_id];
    if (!product) return acc;
    if (!acc[inv.store_id]) acc[inv.store_id] = [];
    acc[inv.store_id].push({
      sku: product.sku,
      name: product.name,
      qty: inv.quantity,
      reorder: inv.reorder_level,
    });
    return acc;
  }, {});

  const stores = storesRes.data.map((store) => ({
    id: store.id,
    name: store.name,
    location: store.location || "",
    active: store.active,
    inventory: inventoryByStoreId[store.id] || [],
  }));

  const productNameToId = Object.fromEntries(productsRes.data.map((p) => [p.name, p.id]));
  const storeNameToId = Object.fromEntries(storesRes.data.map((s) => [s.name, s.id]));

  return { stores, productNameToId, storeNameToId };
}
