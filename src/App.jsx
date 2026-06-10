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
import { supabase } from "./supabase";
import { computeInsightMetrics, generateRiskAlerts } from "./lib/insights";
import { generateRecommendations } from "./lib/recommendations";
import { MOCK_STORES, MOCK_SUGGESTIONS, MOCK_TRANSFERS, MOCK_INSIGHTS } from "./data/mockData";
import "./App.css";

const TABS = ["Dashboard", "Inventory", "Transfers", "Insights", "Settings"];

// Supabase stores transfer timestamps in `created_at`; render them like the
// rest of the UI (e.g. "Jun 8, 2026"), tolerating null/invalid values.
function formatTransferDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

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

function getNextTransferId(transfers) {
  const numericIds = transfers
    .map((transfer) => Number(transfer.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (numericIds.length > 0) {
    return Math.max(...numericIds) + 1;
  }

  return transfers.length + 1;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [theme, toggleTheme] = useTheme();
  const [stores, setStores] = useState(MOCK_STORES);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState("");
  const [suggestions, setSuggestions] = usePersistentState("suggestions", MOCK_SUGGESTIONS);
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);
  const [approvedKeys, setApprovedKeys] = usePersistentState("approvedKeys", []);

  useEffect(() => {
    const loadStores = async () => {
      setStoresLoading(true);
      setStoresError("");
      const [storesResponse, productsResponse, inventoryResponse] = await Promise.all([
        supabase.from("stores").select("id, name, location, active"),
        supabase.from("products").select("id, sku, name, category"),
        supabase.from("inventory").select("id, store_id, product_id, quantity, reorder_level"),
      ]);

      const hasError = storesResponse.error || productsResponse.error || inventoryResponse.error;
      const hasData = storesResponse.data && productsResponse.data && inventoryResponse.data;

      if (hasError || !hasData) {
        setStores(MOCK_STORES);

        const tableErrors = [];
        if (storesResponse.error) {
          console.error("storesResponse.error:", storesResponse.error);
          tableErrors.push(`stores: ${storesResponse.error.message || JSON.stringify(storesResponse.error)}`);
        }
        if (productsResponse.error) {
          console.error("productsResponse.error:", productsResponse.error);
          tableErrors.push(`products: ${productsResponse.error.message || JSON.stringify(productsResponse.error)}`);
        }
        if (inventoryResponse.error) {
          console.error("inventoryResponse.error:", inventoryResponse.error);
          tableErrors.push(`inventory: ${inventoryResponse.error.message || JSON.stringify(inventoryResponse.error)}`);
        }

        if (tableErrors.length > 0) {
          setStoresError(`Failed to load: ${tableErrors.join("; ")}. Showing mock stores.`);
        } else {
          setStoresError("Live store data is incomplete. Showing mock stores instead.");
        }
      } else {
        const productById = Object.fromEntries(
          productsResponse.data.map((p) => [p.id, p])
        );

        const inventoryByStoreId = inventoryResponse.data.reduce((acc, inv) => {
          const product = productById[inv.product_id];
          if (!product) return acc;

          const item = {
            sku: product.sku,
            name: product.name,
            qty: inv.quantity,
            reorder: inv.reorder_level,
          };

          if (!acc[inv.store_id]) acc[inv.store_id] = [];
          acc[inv.store_id].push(item);
          return acc;
        }, {});

        const finalStores = storesResponse.data.map((store) => ({
          id: store.id,
          name: store.name,
          location: store.location || "",
          active: store.active,
          inventory: inventoryByStoreId[store.id] || [],
        }));

        setStores(finalStores);
      }

      setStoresLoading(false);
    };

    loadStores();
  }, []);

  useEffect(() => {
    const loadTransfers = async () => {
      const [transfersResponse, transferItemsResponse, productsResponse, storesResponse] = await Promise.all([
        supabase.from("transfers").select("id, from_store_id, to_store_id, status, created_at"),
        supabase.from("transfer_items").select("transfer_id, product_id, quantity"),
        supabase.from("products").select("id, name"),
        supabase.from("stores").select("id, name"),
      ]);

      const hasError = transfersResponse.error || transferItemsResponse.error || productsResponse.error || storesResponse.error;
      const hasData = transfersResponse.data && transferItemsResponse.data && productsResponse.data && storesResponse.data;

      if (hasError || !hasData) {
        setTransfers(MOCK_TRANSFERS);
        return;
      }

      const productById = Object.fromEntries(productsResponse.data.map((p) => [p.id, p]));
      const storeById = Object.fromEntries(storesResponse.data.map((s) => [s.id, s]));

      const mappedTransfers = [];
      for (const transfer of transfersResponse.data) {
        const items = transferItemsResponse.data.filter((item) => item.transfer_id === transfer.id);
        for (const item of items) {
          const product = productById[item.product_id];
          const fromStore = storeById[transfer.from_store_id];
          const toStore = storeById[transfer.to_store_id];

          mappedTransfers.push({
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

      setTransfers(mappedTransfers);
    };

    loadTransfers();
  }, []);

  const handleApprove = (suggestion) => {
    const nextId = getNextTransferId(transfers);
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    setTransfers((currentTransfers) => [
      { id: nextId, product: suggestion.product, from: suggestion.from, to: suggestion.to, qty: suggestion.qty, status: "Approved", date: today },
      ...currentTransfers,
    ]);

    setSuggestions((currentSuggestions) => currentSuggestions.filter((item) => item !== suggestion));

    const key = buildRecommendationKey(suggestion.product, suggestion.from, suggestion.to, suggestion.qty);
    setApprovedKeys((currentKeys) =>
      currentKeys.includes(key) ? currentKeys : [...currentKeys, key]
    );
  };

  const handleDismiss = (suggestion) => {
    setSuggestions((currentSuggestions) => currentSuggestions.filter((item) => item !== suggestion));
  };

  const generatedRecommendations = useMemo(
    () => generateRecommendations(stores),
    [stores]
  );

  const filteredGeneratedRecommendations = useMemo(() => {
    return generatedRecommendations.filter((rec) => {
      const key = buildRecommendationKey(rec.product, rec.from, rec.to, rec.qty);
      return !approvedKeys.includes(key);
    });
  }, [generatedRecommendations, approvedKeys]);

  const insights = useMemo(
    () => ({
      ...MOCK_INSIGHTS,
      metrics: computeInsightMetrics(stores, transfers),
      recommendations: filteredGeneratedRecommendations,
      alerts: generateRiskAlerts(stores),
    }),
    [stores, transfers, filteredGeneratedRecommendations]
  );

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
      return suggestions;
    }

    return [];
  }, [filteredGeneratedRecommendations, generatedRecommendations, suggestions]);

  const aiSuggestionActions =
    filteredGeneratedRecommendations.length === 0 && generatedRecommendations.length === 0
      ? handleDismiss
      : undefined;

  const renderMainContent = () => {
    switch (activeTab) {
      case "Inventory":
        return <InventoryTab stores={stores} />;
      case "Transfers":
        return <TransfersTab transfers={transfers} />;
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

        {(storesLoading || storesError) && (
          <div className="stores-status" style={{ marginBottom: "1rem" }}>
            {storesLoading ? "Loading stores…" : storesError}
          </div>
        )}

        <div className="page-grid">
          <main className="main-content">{renderMainContent()}</main>

          <aside className="insights-panel">
            <AIAssistant suggestions={aiSuggestions} onApprove={handleApprove} onDismiss={aiSuggestionActions} />
            <TransferTracking transfers={transfers} />
          </aside>
        </div>
      </div>
    </div>
  );
}
