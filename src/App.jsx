import { useState } from "react";
import "./index.css";
import Header from "./components/Header";
import AIAssistant from "./components/AIAssistant";
import TransferTracking from "./components/TransferTracking";
import DashboardTab from "./components/DashboardTab";
import InventoryTab from "./components/InventoryTab";
import TransfersTab from "./components/TransfersTab";
import InsightsTab from "./components/InsightsTab";
import Settings from "./components/Settings";
import usePersistentState from "./hooks/usePersistentState";
import { MOCK_STORES, MOCK_SUGGESTIONS, MOCK_TRANSFERS, MOCK_INSIGHTS } from "./data/mockData";
import "./App.css";

const TABS = ["Dashboard", "Inventory", "Transfers", "Insights", "Settings"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [stores] = useState(MOCK_STORES);
  const [suggestions, setSuggestions] = usePersistentState("suggestions", MOCK_SUGGESTIONS);
  const [transfers, setTransfers] = usePersistentState("transfers", MOCK_TRANSFERS);

  const handleApprove = (suggestion) => {
    const nextId = transfers.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTransfers([
      { id: nextId, product: suggestion.product, from: suggestion.from, to: suggestion.to, qty: suggestion.qty, status: "Approved", date: today },
      ...transfers,
    ]);
    setSuggestions(suggestions.filter((item) => item !== suggestion));
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case "Inventory":
        return <InventoryTab stores={stores} />;
      case "Transfers":
        return <TransfersTab transfers={transfers} />;
      case "Insights":
        return <InsightsTab insights={MOCK_INSIGHTS} />;
      case "Settings":
        return <Settings />;
      default:
        return <DashboardTab stores={stores} />;
    }
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
