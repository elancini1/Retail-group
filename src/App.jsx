import { useState } from "react";
import "./index.css";
import Topbar from "./components/Topbar";
import AIAssistant from "./components/AIAssistant";
import TransferTracking from "./components/TransferTracking";
import DashboardTab from "./components/DashboardTab";
import InventoryTab from "./components/InventoryTab";
import TransfersTab from "./components/TransfersTab";
import InsightsTab from "./components/InsightsTab";
import Settings from "./components/Settings";
import usePersistentState from "./hooks/usePersistentState";
import useTheme from "./hooks/useTheme";
import { MOCK_STORES, MOCK_SUGGESTIONS, MOCK_TRANSFERS, MOCK_INSIGHTS } from "./data/mockData";
import "./App.css";

const TABS = ["Dashboard", "Inventory", "Transfers", "Insights", "Settings"];

const PAGE_META = {
  Dashboard: "Inventory health, transfers, and alerts at a glance.",
  Inventory: "Search and monitor stock across every store.",
  Transfers: "Coordinate and track stock transfers between stores.",
  Insights: "AI-powered recommendations and performance trends.",
  Settings: "Manage your company, stores, and preferences.",
};

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [theme, toggleTheme] = useTheme();
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

  const handleDismiss = (suggestion) => {
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
      <Topbar
        tabs={TABS}
        activeTab={activeTab}
        onSelect={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="page-shell">
        <div className="page-head">
          <h1>{activeTab}</h1>
          <p className="muted">{PAGE_META[activeTab]}</p>
        </div>

        <div className="page-grid">
          <main className="main-content">{renderMainContent()}</main>

          <aside className="insights-panel">
            <AIAssistant suggestions={suggestions} onApprove={handleApprove} onDismiss={handleDismiss} />
            <TransferTracking transfers={transfers} />
          </aside>
        </div>
      </div>
    </div>
  );
}
