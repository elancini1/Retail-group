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

      if (productsResponse.data) {
        setProductNameToId(Object.fromEntries(productsResponse.data.map((p) => [p.name, p.id])));
      }
      if (storesResponse.data) {
        setStoreNameToId(Object.fromEntries(storesResponse.data.map((s) => [s.name, s.id])));
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

    const transferId = crypto.randomUUID();
    const { data: insertedTransfer, error: transferInsertError } = await supabase
      .from("transfers")
      .insert([
        {
          id: transferId,
          from_store_id: fromStoreId,
          to_store_id: toStoreId,
          status: "Approved",
          created_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (transferInsertError || !insertedTransfer?.id) {
      console.error("transfer insert failed:", transferInsertError);
      setTransferError(`Failed to save transfer: ${transferInsertError?.message || "Unknown error."}`);
      return;
    }

    const { error: transferItemError } = await supabase.from("transfer_items").insert([
      {
        id: crypto.randomUUID(),
        transfer_id: transferId,
        product_id: productId,
        quantity: suggestion.qty,
      },
    ]);

    if (transferItemError) {
      console.error("transfer item insert failed:", transferItemError);
      await supabase.from("transfers").delete().eq("id", transferId);
      setTransferError(`Failed to save transfer item: ${transferItemError.message || "Unknown error."}`);
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

    const { error: updateError } = await supabase
      .from("transfers")
      .update({ status: newStatus })
      .eq("id", transferId);

    if (updateError) {
      console.error("transfer status update failed:", updateError);
      setTransferError(`Failed to update transfer status: ${updateError.message || "Unknown error."}`);
      return false;
    }

    setTransfers((currentTransfers) =>
      currentTransfers.map((item) =>
        String(item.id) === String(transferId) ? { ...item, status: newStatus } : item
      )
    );

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

  const insights = useMemo(
    () => ({
      ...MOCK_INSIGHTS,
      metrics: computeInsightMetrics(stores, transfers),
      recommendations: filteredGeneratedRecommendations,
      alerts: generateRiskAlerts(stores),
    }),
    [stores, transfers, filteredGeneratedRecommendations]
  );

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
