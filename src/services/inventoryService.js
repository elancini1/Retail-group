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
