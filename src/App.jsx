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
  { id: 1, product: "Summer Dress", from: "Uptown Store", to: "Downtown Store", qty: 10, status: "Approved", date: "May 18, 2026" },
  { id: 2, product: "White T-Shirt", from: "Uptown Store", to: "Downtown Store", qty: 6, status: "In Transit", date: "May 22, 2026" },
  { id: 3, product: "Blue Jeans", from: "Downtown Store", to: "Uptown Store", qty: 8, status: "Reconciled", date: "May 15, 2026" },
];

const MOCK_INSIGHTS = {
  recommendations: [
    {
      title: "Transfer 10 Summer Dresses from Uptown Store to Downtown Store",
      confidence: "92%",
      impact: "Reduce stockout risk by 18%",
      action: "Approve transfer",
    },
    {
      title: "Transfer 5 White T-Shirts from Suburban Store to Uptown Store",
      confidence: "88%",
      impact: "Improve availability for weekend demand",
      action: "Review recommendation",
    },
  ],
  alerts: [
    {
      product: "Summer Dress",
      type: "Stockout risk",
      detail: "Downtown Store may run out in 3 days",
    },
    {
      product: "Blue Jeans",
      type: "Excess inventory",
      detail: "Uptown Store has 28 units above target",
    },
  ],
  chat: [
    {
      question: "How is Store 2 performing this week?",
      answer: "Store 2 is up 12% in stock turnover with strong demand for seasonal apparel.",
    },
    {
      question: "Which products are at risk of stockout?",
      answer: "Summer Dress and White T-Shirt are the two highest risk items over the next 72 hours.",
    },
    {
      question: "What transfers should I prioritize?",
      answer: "Move Summer Dresses to Downtown and shift White T-Shirts to Uptown to balance inventory.",
    },
  ],
  metrics: [
    { label: "Stockouts prevented", value: "24" },
    { label: "Transfer efficiency", value: "89%" },
    { label: "Inventory balance", value: "87" },
  ],
};

const TABS = ["Dashboard", "Inventory", "Transfers", "Insights", "Settings"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stores] = useState(MOCK_STORES);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("All");

  const lowAlerts = stores.reduce((total, store) => total + store.inventory.filter((item) => item.qty < item.reorder).length, 0);
  const totalUnits = stores.reduce((total, store) => total + store.inventory.reduce((sum, item) => sum + item.qty, 0), 0);

  const inventoryProducts = stores.flatMap((store) =>
    store.inventory.map((item) => ({
      ...item,
      store: store.name,
      status: item.qty < item.reorder ? "Low stock" : "Healthy",
    }))
  );

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
      const filteredInventory = inventoryProducts
        .filter((item) =>
          item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
          item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
          item.store.toLowerCase().includes(inventorySearch.toLowerCase())
        )
        .filter((item) => {
          if (inventoryFilter === "All") return true;
          if (inventoryFilter === "Low stock") return item.status === "Low stock";
          return item.status === "Healthy";
        });

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
              value={inventorySearch}
              onChange={(event) => setInventorySearch(event.target.value)}
              placeholder="Search products, SKUs, or stores"
            />
            <div className="filter-group">
              {['All', 'Low stock', 'Healthy'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`filter-button ${inventoryFilter === filter ? 'active' : ''}`}
                  onClick={() => setInventoryFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="empty-state">
              <strong>No inventory items found.</strong>
              <p className="muted">Try adjusting your search term or clearing the filter to see more items.</p>
            </div>
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
                        <span className={`status-pill ${item.status === 'Low stock' ? 'status-low' : 'status-healthy'}`}>
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

    if (activeTab === "Transfers") {
      const totalTransfers = transfers.length;
      const inTransitCount = transfers.filter((item) => item.status === "In Transit").length;
      const completedCount = transfers.filter((item) => item.status === "Reconciled").length;
      const selectedTransfer = transfers.find((item) => item.status === "In Transit") || transfers[0];
      const stages = ["Requested", "Approved", "In Transit", "Received", "Reconciled"];
      const currentStage = selectedTransfer.status === "Approved" ? "Approved" : selectedTransfer.status === "In Transit" ? "In Transit" : "Reconciled";
      const currentStageIndex = stages.indexOf(currentStage);

      return (
        <>
          <section className="transfer-metrics">
            <div className="stat-card">
              <div className="stat-label">Total transfers</div>
              <div className="stat-value">{totalTransfers}</div>
              <div className="stat-note">Open and historical requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In transit</div>
              <div className="stat-value">{inTransitCount}</div>
              <div className="stat-note">Shipments currently moving</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{completedCount}</div>
              <div className="stat-note">Transfers fully reconciled</div>
            </div>
          </section>

          <section className="card section-card">
            <div className="section-heading">
              <div>
                <h3>Transfer requests</h3>
                <p className="muted">Review requested shipments and their current status.</p>
              </div>
            </div>

            <div className="transfer-table-wrap">
              <table className="transfer-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>From Store</th>
                    <th>To Store</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product}</td>
                      <td>{item.from}</td>
                      <td>{item.to}</td>
                      <td>{item.qty}</td>
                      <td>
                        <span className={`status-pill ${item.status === "Reconciled" ? "status-healthy" : item.status === "In Transit" ? "status-in-transit" : "status-approved"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card section-card transfer-summary-card">
            <div className="section-heading">
              <div>
                <h3>Transfer status timeline</h3>
                <p className="muted">Track the current shipment progress through every stage.</p>
              </div>
            </div>

            <div className="timeline">
              {stages.map((stage, index) => {
                const isComplete = index <= currentStageIndex;
                return (
                  <div key={stage} className={`timeline-step ${isComplete ? "completed" : ""}`}>
                    <div className="step-dot" />
                    <div className="step-label">{stage}</div>
                  </div>
                );
              })}
            </div>

            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-title">Product</div>
                <div>{selectedTransfer.product}</div>
              </div>
              <div className="detail-card">
                <div className="detail-title">Quantity</div>
                <div>{selectedTransfer.qty}</div>
              </div>
              <div className="detail-card">
                <div className="detail-title">Origin store</div>
                <div>{selectedTransfer.from}</div>
              </div>
              <div className="detail-card">
                <div className="detail-title">Destination store</div>
                <div>{selectedTransfer.to}</div>
              </div>
              <div className="detail-card detail-full">
                <div className="detail-title">Current status</div>
                <div>
                  <span className={`status-pill ${selectedTransfer.status === "Reconciled" ? "status-healthy" : selectedTransfer.status === "In Transit" ? "status-in-transit" : "status-approved"}`}>
                    {selectedTransfer.status}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      );
    }

    if (activeTab === "Insights") {
      return (
        <>
          <section className="summary-row">
            {MOCK_INSIGHTS.metrics.map((metric) => (
              <div key={metric.label} className="stat-card">
                <div className="stat-label">{metric.label}</div>
                <div className="stat-value">{metric.value}</div>
                <div className="stat-note">AI-powered performance score</div>
              </div>
            ))}
          </section>

          <section className="card section-card">
            <div className="section-heading">
              <div>
                <h3>AI recommendations</h3>
                <p className="muted">Suggested inventory moves based on forecasted demand.</p>
              </div>
            </div>

            <div className="recommendations-grid">
              {MOCK_INSIGHTS.recommendations.map((item) => (
                <div key={item.title} className="recommendation-card">
                  <div className="recommendation-copy">
                    <strong>{item.title}</strong>
                    <p className="muted">Expected impact: {item.impact}</p>
                  </div>
                  <div className="recommendation-footer">
                    <span className="confidence-chip">{item.confidence} confidence</span>
                    <button type="button" className="btn recommendation-action">{item.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card section-card">
            <div className="section-heading">
              <div>
                <h3>Inventory risk alerts</h3>
                <p className="muted">Monitor products that need immediate action or rebalancing.</p>
              </div>
            </div>

            <div className="risk-alerts-list">
              {MOCK_INSIGHTS.alerts.map((alert) => (
                <div key={alert.product} className="risk-alert">
                  <div>
                    <strong>{alert.product}</strong>
                    <div className="muted">{alert.detail}</div>
                  </div>
                  <span className="alert-pill">{alert.type}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card section-card">
            <div className="section-heading">
              <div>
                <h3>AI assistant</h3>
                <p className="muted">Example questions and mock responses from your inventory advisor.</p>
              </div>
            </div>

            <div className="ai-chat-card">
              {MOCK_INSIGHTS.chat.map((entry) => (
                <div key={entry.question} className="chat-pair">
                  <div className="chat-bubble chat-user">{entry.question}</div>
                  <div className="chat-bubble chat-assistant">{entry.answer}</div>
                </div>
              ))}
            </div>
          </section>
        </>
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