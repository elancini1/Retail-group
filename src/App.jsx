import React, { useState } from "react";
import "./index.css";
import Header from "./components/Header";
import StoreOverview from "./components/StoreOverview";
import AIAssistant from "./components/AIAssistant";
import Alerts from "./components/Alerts";
import TransferTracking from "./components/TransferTracking";
import "./App.css";

const MOCK_STORES = [
  {
    id: "s1",
    name: "Downtown Store",
    location: "Main Street",
    inventory: [
      { sku: "SD-001", name: "Summer Dress", qty: 4, reorder: 10 },
      { sku: "WT-002", name: "White T-Shirt", qty: 18, reorder: 12 },
      { sku: "BJ-003", name: "Blue Jeans", qty: 40, reorder: 20 },
    ],
  },
  {
    id: "s2",
    name: "Uptown Store",
    location: "Mall Plaza",
    inventory: [
      { sku: "SD-001", name: "Summer Dress", qty: 28, reorder: 10 },
      { sku: "WT-002", name: "White T-Shirt", qty: 60, reorder: 12 },
      { sku: "BJ-003", name: "Blue Jeans", qty: 12, reorder: 20 },
    ],
  },
];

const MOCK_SUGGESTIONS = [
  { product: "Summer Dress", from: "Uptown Store", to: "Downtown Store", qty: 10 },
  { product: "Blue Jeans", from: "Downtown Store", to: "Uptown Store", qty: 10 },
];

const MOCK_TRANSFERS = [
  { id: 1, product: "Summer Dress", from: "Uptown Store", to: "Downtown Store", qty: 10, status: "Approved" },
  { id: 2, product: "White T-Shirt", from: "Uptown Store", to: "Downtown Store", qty: 6, status: "In Transit" },
  { id: 3, product: "Blue Jeans", from: "Uptown Store", to: "Downtown Store", qty: 8, status: "Reconciled" },
];

const TABS = ["Dashboard", "Inventory", "Transfers", "Insights", "Settings"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stores] = useState(MOCK_STORES);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  const lowAlerts = stores.reduce((total, store) => total + store.inventory.filter((item) => item.qty < item.reorder).length, 0);
  const totalUnits = stores.reduce((total, store) => total + store.inventory.reduce((sum, item) => sum + item.qty, 0), 0);

  const handleApprove = (s) => {
    const nextId = transfers.length + 1;
    setTransfers([{ id: nextId, product: s.product, from: s.from, to: s.to, qty: s.qty, status: "Approved" }, ...transfers]);
    setSuggestions(suggestions.filter((x) => x !== s));
  };

  const renderMainContent = () => {
    if (activeTab === "Dashboard") {
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

    if (activeTab === "Inventory") {
      return (
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <h3>Inventory overview</h3>
              <p className="muted">View product stock across your stores.</p>
            </div>
          </div>
          <StoreOverview stores={stores} />
        </section>
      );
    }

    if (activeTab === "Transfers") {
      return (
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <h3>Transfer tracking</h3>
              <p className="muted">Monitor transfer statuses from approval through reconciliation.</p>
            </div>
          </div>
          <TransferTracking transfers={transfers} />
        </section>
      );
    }

    if (activeTab === "Insights") {
      return (
        <section className="card section-card">
          <div className="section-heading">
            <div>
              <h3>Insights</h3>
              <p className="muted">See the latest suggestions and inventory trends.</p>
            </div>
          </div>
          <AIAssistant suggestions={suggestions} onApprove={handleApprove} />
        </section>
      );
    }

    return (
      <section className="card section-card">
        <div className="section-heading">
          <div>
            <h3>Settings</h3>
            <p className="muted">Configure your dashboard experience.</p>
          </div>
        </div>
        <div className="muted">Settings controls are coming soon for this MVP interface.</div>
      </section>
    );
  };

  return (
    <div className="app">
      <div className="page-shell">
        <Header />

        <nav className="tabs-nav" aria-label="Dashboard navigation">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="page-grid">
          <main className="main-content">
            {renderMainContent()}
          </main>

          <aside className="insights-panel">
            <AIAssistant suggestions={suggestions} onApprove={handleApprove} />
            <div className="spaced">
              <TransferTracking transfers={transfers} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}