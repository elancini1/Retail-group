import { useEffect, useMemo, useState } from "react";
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
import { getStoresWithInventory } from "./services/storeService";
import { getTransfers, createTransfer, updateTransferStatus } from "./services/transferService";
import { computeInsightMetrics, generateRiskAlerts } from "./lib/insights";
import { generateRecommendations } from "./lib/recommendations";
import { generateInsightChat } from "./lib/insightsChat";
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

function buildRecommendationKey(product, from, to, qty) {
  return `${product}|${from}|${to}|${qty}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [theme, toggleTheme] = useTheme();
  const [stores, setStores] = useState(MOCK_STORES);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState("");
  const [transferError, setTransferError] = useState("");
  const [productNameToId, setProductNameToId] = useState({});
  const [storeNameToId, setStoreNameToId] = useState({});
  const [suggestions, setSuggestions] = usePersistentState("suggestions", MOCK_SUGGESTIONS);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);
  const [approvedKeys, setApprovedKeys] = usePersistentState("approvedKeys", []);
  const [rejectedKeys, setRejectedKeys] = usePersistentState("rejectedKeys", []);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  useEffect(() => {
    const loadStores = async () => {
      setStoresLoading(true);
      setStoresError("");
      try {
        const { stores, productNameToId, storeNameToId } = await getStoresWithInventory();
        setStores(stores);
        setProductNameToId(productNameToId);
        setStoreNameToId(storeNameToId);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores(MOCK_STORES);
        setStoresError(
          error.tableErrors?.length
            ? `Failed to load: ${error.tableErrors.join("; ")}. Showing mock stores.`
            : "Live store data is incomplete. Showing mock stores instead."
        );
      } finally {
        setStoresLoading(false);
      }
    };

    loadStores();
  }, []);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        setTransfers(await getTransfers());
      } catch (error) {
        console.error("Failed to load transfers:", error);
        setTransfers(MOCK_TRANSFERS);
      }
    };

    loadTransfers();
  }, []);

  const handleApprove = async (suggestion) => {
    setTransferError("");

    const fromStoreId = storeNameToId[suggestion.from] || stores.find((store) => store.name === suggestion.from)?.id;
    const toStoreId = storeNameToId[suggestion.to] || stores.find((store) => store.name === suggestion.to)?.id;
    const productId = productNameToId[suggestion.product];

    if (!fromStoreId || !toStoreId || !productId) {
      setTransferError(
        "Unable to approve transfer: missing store or product IDs from loaded data. Please refresh and try again."
      );
      return;
    }

    let transferId;
    try {
      transferId = await createTransfer({ fromStoreId, toStoreId, productId, qty: suggestion.qty });
    } catch (error) {
      console.error("transfer save failed:", error);
      setTransferError(`Failed to save transfer: ${error.message}`);
      return;
    }

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    setTransfers((currentTransfers) => [
      { id: transferId, product: suggestion.product, from: suggestion.from, to: suggestion.to, qty: suggestion.qty, status: "Approved", date: today },
      ...currentTransfers,
    ]);

    setSuggestions((currentSuggestions) => currentSuggestions.filter((item) => item !== suggestion));

    const key = buildRecommendationKey(suggestion.product, suggestion.from, suggestion.to, suggestion.qty);
    setApprovedKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key]
    );
  };

  const handleReject = (suggestion) => {
    const key = buildRecommendationKey(suggestion.product, suggestion.from, suggestion.to, suggestion.qty);
    setRejectedKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key]
    );
    setSuggestions((currentSuggestions) => currentSuggestions.filter((item) => item !== suggestion));
  };

  const handleUpdateTransferStatus = async (transferId, newStatus) => {
    setTransferError("");

    try {
      await updateTransferStatus(transferId, newStatus);
    } catch (error) {
      console.error("transfer status update failed:", error);
      setTransferError(`Failed to update transfer status: ${error.message}`);
      return false;
    }

    setTransfers((currentTransfers) =>
      currentTransfers.map((item) =>
        String(item.id) === String(transferId) ? { ...item, status: newStatus } : item
      )
    );

    // If we just reconciled, refresh stores/inventory so UI updates immediately.
    if (newStatus === "Reconciled") {
      setStoresLoading(true);
      setStoresError("");
      try {
        const { stores, productNameToId, storeNameToId } = await getStoresWithInventory();
        setStores(stores);
        setProductNameToId(productNameToId);
        setStoreNameToId(storeNameToId);
      } catch (error) {
        console.error("Failed to refresh stores after reconciliation:", error);
        setStoresError(
          error.tableErrors?.length
            ? `Failed to load: ${error.tableErrors.join("; ")}.` 
            : "Failed to refresh stores after reconciliation."
        );
      } finally {
        setStoresLoading(false);
      }
    }

    return true;
  };

  const generatedRecommendations = useMemo(
    () => generateRecommendations(stores),
    [stores]
  );

  const filteredGeneratedRecommendations = useMemo(() => {
    return generatedRecommendations.filter((rec) => {
      const key = buildRecommendationKey(rec.product, rec.from, rec.to, rec.qty);
      return !approvedKeys.includes(key) && !rejectedKeys.includes(key);
    });
  }, [generatedRecommendations, approvedKeys, rejectedKeys]);

  const insights = useMemo(() => {
    const metrics = computeInsightMetrics(stores, transfers);
    const alerts = generateRiskAlerts(stores, transfers);
    const chat = generateInsightChat(
      stores,
      metrics,
      alerts,
      filteredGeneratedRecommendations
    );

    return {
      ...MOCK_INSIGHTS,
      metrics,
      recommendations: filteredGeneratedRecommendations,
      alerts,
      chat,
    };
  }, [stores, transfers, filteredGeneratedRecommendations]);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((suggestion) => {
      const key = buildRecommendationKey(suggestion.product, suggestion.from, suggestion.to, suggestion.qty);
      return !approvedKeys.includes(key) && !rejectedKeys.includes(key);
    });
  }, [suggestions, approvedKeys, rejectedKeys]);

  const aiSuggestions = useMemo(() => {
    if (filteredGeneratedRecommendations.length > 0) {
      return filteredGeneratedRecommendations.map((recommendation) => ({
        product: recommendation.product,
        qty: recommendation.qty,
        from: recommendation.from,
        to: recommendation.to,
      }));
    }

    if (generatedRecommendations.length === 0) {
      return filteredSuggestions;
    }

    return [];
  }, [filteredGeneratedRecommendations, generatedRecommendations, filteredSuggestions]);

  // Default to the first transfer until the user selects one (pure derivation,
  // no setState-in-effect).
  const effectiveSelectedId =
    selectedTransferId ?? (transfers.length > 0 ? String(transfers[0].id) : null);
  const selectedTransfer =
    transfers.find((item) => String(item.id) === String(effectiveSelectedId)) || transfers[0];

  const renderMainContent = () => {
    switch (activeTab) {
      case "Inventory":
        return <InventoryTab stores={stores} />;
      case "Transfers":
        return (
          <TransfersTab
            transfers={transfers}
            selectedTransfer={selectedTransfer}
            selectedTransferId={effectiveSelectedId}
            onSelectTransfer={setSelectedTransferId}
            onUpdateTransferStatus={handleUpdateTransferStatus}
          />
        );
      case "Insights":
        return <InsightsTab insights={insights} />;
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

        {(storesLoading || storesError || transferError) && (
          <div className="stores-status" style={{ marginBottom: "1rem" }}>
            {storesLoading
              ? "Loading stores…"
              : [storesError, transferError].filter(Boolean).join(" ")}
          </div>
        )}

        <div className="page-grid">
          <main className="main-content">{renderMainContent()}</main>

          <aside className="insights-panel">
            <AIAssistant suggestions={aiSuggestions} onApprove={handleApprove} onReject={handleReject} />
            <TransferTracking transfers={transfers} />
          </aside>
        </div>
      </div>
    </div>
  );
}
