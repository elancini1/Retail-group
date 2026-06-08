import { useState } from "react";
import EmptyState from "./EmptyState";

const FILTERS = ["All", "Low stock", "Healthy"];

export default function InventoryTab({ stores }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const products = stores.flatMap((store) =>
    store.inventory.map((item) => ({
      ...item,
      store: store.name,
      status: item.qty < item.reorder ? "Low stock" : "Healthy",
    }))
  );

  const query = search.toLowerCase();
  const filteredInventory = products
    .filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.store.toLowerCase().includes(query)
    )
    .filter((item) => filter === "All" || item.status === filter);

  return (
    <section className="card section-card">
      <div className="section-heading">
        <div>
          <h3>Inventory</h3>
          <p className="muted">Search products, filter by stock status, and monitor stock across stores.</p>
        </div>
      </div>

      <div className="inventory-tools">
        <input
          className="search-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products, SKUs, or stores"
        />
        <div className="filter-group">
          {FILTERS.map((option) => (
            <button
              key={option}
              type="button"
              className={`filter-button ${filter === option ? "active" : ""}`}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <EmptyState
          title="No inventory items found."
          message="Try adjusting your search term or clearing the filter to see more items."
        />
      ) : (
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Store</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={`${item.sku}-${item.store}`}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.store}</td>
                  <td>{item.qty}</td>
                  <td>
                    <span className={`status-pill ${item.status === "Low stock" ? "status-low" : "status-healthy"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
