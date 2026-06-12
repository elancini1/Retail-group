import { useMemo, useState } from "react";
import EmptyState from "./EmptyState";
import BarChart from "./charts/BarChart";
import MetricTile from "./MetricTile";
import SectionHeader from "./SectionHeader";
import { TransferIcon, ClockIcon, CheckIcon, ChartBarsIcon, ListIcon } from "./icons/Icons";

const STAGES = ["Requested", "Approved", "In Transit", "Received", "Reconciled"];

function statusPillClass(status) {
  if (status === "Approved") return "status-pill status-approved";
  if (status === "In Transit") return "status-pill status-in-transit";
  if (status === "Received") return "status-pill status-received";
  if (status === "Reconciled") return "status-pill status-reconciled";
  return "status-pill";
}

function getNextStatusAction(currentStatus) {
  if (currentStatus === "Approved") return { label: "Mark In Transit", nextStatus: "In Transit" };
  if (currentStatus === "In Transit") return { label: "Mark Received", nextStatus: "Received" };
  if (currentStatus === "Received") return { label: "Mark Reconciled", nextStatus: "Reconciled" };
  return null;
}

// Numeric for qty, timestamp for date, case-insensitive string otherwise.
function compareTransfers(key, dir) {
  const mult = dir === "asc" ? 1 : -1;
  return (a, b) => {
    if (key === "qty") return (a.qty - b.qty) * mult;
    if (key === "date") return ((Date.parse(a.date) || 0) - (Date.parse(b.date) || 0)) * mult;
    return String(a[key] || "").localeCompare(String(b[key] || "")) * mult;
  };
}

function SortHeader({ label, sortKey, sort, onSort }) {
  const active = sort.key === sortKey;
  return (
    <th aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={`th-sort${active ? " active" : ""}`} onClick={() => onSort(sortKey)}>
        {label}
        <span className="th-arrow">{active ? (sort.dir === "asc" ? "↑" : "↓") : ""}</span>
      </button>
    </th>
  );
}

export default function TransfersTab({ transfers, selectedTransfer, selectedTransferId, onSelectTransfer, onUpdateTransferStatus }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // Default to most recent first.
  const [sort, setSort] = useState({ key: "date", dir: "desc" });

  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "date" || key === "qty" ? "desc" : "asc" }
    );
  };

  const filterOptions = useMemo(() => {
    const present = [...new Set(transfers.map((t) => t.status))].sort(
      (a, b) => STAGES.indexOf(a) - STAGES.indexOf(b)
    );
    return ["All", ...present];
  }, [transfers]);

  const visibleTransfers = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = transfers.filter((t) => {
      const matchesQuery =
        !q ||
        t.product.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    return filtered.sort(compareTransfers(sort.key, sort.dir));
  }, [transfers, query, statusFilter, sort]);

  if (transfers.length === 0) {
    return (
      <section className="card section-card">
        <SectionHeader icon={ListIcon} title="Transfer requests" subtitle="Review requested shipments and their current status." />
        <EmptyState
          title="No transfer requests yet"
          message="Approve an AI suggestion from the side panel to create your first transfer request."
        />
      </section>
    );
  }

  const inTransitCount = transfers.filter((item) => item.status === "In Transit").length;
  const completedCount = transfers.filter((item) => item.status === "Reconciled").length;
  const approvedCount = transfers.filter((item) => item.status === "Approved").length;
  const statusBreakdown = [
    { label: "Approved", value: approvedCount, color: "#2563eb" },
    { label: "In Transit", value: inTransitCount, color: "#f59e0b" },
    { label: "Received", value: transfers.filter((t) => t.status === "Received").length, color: "#7c3aed" },
    { label: "Reconciled", value: completedCount, color: "#16a34a" },
  ];
  const currentStageIndex = Math.max(
    0,
    STAGES.indexOf(selectedTransfer.status || "Requested")
  );

  return (
    <>
      <section className="dash-tiles">
        <MetricTile icon={TransferIcon} label="Total transfers" value={transfers.length} hint="Open and historical" tone="accent" />
        <MetricTile icon={ClockIcon} label="In transit" value={inTransitCount} hint="Currently moving" tone="warn" />
        <MetricTile icon={CheckIcon} label="Completed" value={completedCount} hint="Fully reconciled" tone="ok" />
      </section>

      <section className="card section-card">
        <SectionHeader icon={ChartBarsIcon} title="Transfers by status" subtitle="How all requests are distributed across their current status." />
        <BarChart data={statusBreakdown} />
      </section>

      <section className="card section-card">
        <SectionHeader icon={ListIcon} title="Transfer requests" subtitle="Search, filter, and sort the full transfer history." />

        <div className="inventory-tools">
          <input
            className="search-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product or store"
          />
          <div className="filter-group">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter-button ${statusFilter === option ? "active" : ""}`}
                onClick={() => setStatusFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {visibleTransfers.length === 0 ? (
          <EmptyState
            title="No matching transfers"
            message="Try a different search term or clear the status filter."
          />
        ) : (
          <div className="transfer-table-wrap">
            <table className="transfer-table">
              <thead>
                <tr>
                  <SortHeader label="Product" sortKey="product" sort={sort} onSort={handleSort} />
                  <SortHeader label="From Store" sortKey="from" sort={sort} onSort={handleSort} />
                  <SortHeader label="To Store" sortKey="to" sort={sort} onSort={handleSort} />
                  <SortHeader label="Quantity" sortKey="qty" sort={sort} onSort={handleSort} />
                  <SortHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
                  <SortHeader label="Date" sortKey="date" sort={sort} onSort={handleSort} />
                </tr>
              </thead>
              <tbody>
                {visibleTransfers.map((item) => {
                  const isSelected = String(item.id) === String(selectedTransferId);
                  return (
                    <tr
                      key={item.id}
                      className={isSelected ? "row-selected" : ""}
                      onClick={() => onSelectTransfer(item.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{item.product}</td>
                      <td>{item.from}</td>
                      <td>{item.to}</td>
                      <td>{item.qty}</td>
                      <td>
                        <span className={statusPillClass(item.status)}>{item.status}</span>
                      </td>
                      <td>{item.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card section-card transfer-summary-card">
        <SectionHeader icon={TransferIcon} title="Transfer status timeline" subtitle="Track the current shipment progress through every stage." />

        <div className="timeline">
          {STAGES.map((stage, index) => (
            <div key={stage} className={`timeline-step ${index <= currentStageIndex ? "completed" : ""}`}>
              <div className="step-dot" />
              <div className="step-label">{stage}</div>
            </div>
          ))}
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
              <span className={statusPillClass(selectedTransfer.status)}>{selectedTransfer.status}</span>
            </div>
          </div>
          {getNextStatusAction(selectedTransfer.status) && (
            <div className="detail-card detail-full">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() =>
                  onUpdateTransferStatus(
                    selectedTransfer.id,
                    getNextStatusAction(selectedTransfer.status).nextStatus
                  )
                }
              >
                {getNextStatusAction(selectedTransfer.status).label}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
