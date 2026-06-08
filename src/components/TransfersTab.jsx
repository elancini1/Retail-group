import EmptyState from "./EmptyState";
import BarChart from "./charts/BarChart";
import MetricTile from "./MetricTile";
import SectionHeader from "./SectionHeader";
import { TransferIcon, ClockIcon, CheckIcon, ChartBarsIcon, ListIcon } from "./icons/Icons";

const STAGES = ["Requested", "Approved", "In Transit", "Received", "Reconciled"];

function statusPillClass(status) {
  if (status === "Reconciled") return "status-pill status-healthy";
  if (status === "In Transit") return "status-pill status-in-transit";
  return "status-pill status-approved";
}

export default function TransfersTab({ transfers }) {
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

  const approvedCount = transfers.filter((item) => item.status === "Approved").length;
  const inTransitCount = transfers.filter((item) => item.status === "In Transit").length;
  const completedCount = transfers.filter((item) => item.status === "Reconciled").length;
  const statusBreakdown = [
    { label: "Approved", value: approvedCount, color: "#16a34a" },
    { label: "In Transit", value: inTransitCount, color: "#f59e0b" },
    { label: "Reconciled", value: completedCount, color: "#64748b" },
  ];
  const selectedTransfer = transfers.find((item) => item.status === "In Transit") || transfers[0];
  const currentStageIndex = STAGES.indexOf(
    selectedTransfer.status === "Approved"
      ? "Approved"
      : selectedTransfer.status === "In Transit"
      ? "In Transit"
      : "Reconciled"
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
        <SectionHeader icon={ListIcon} title="Transfer requests" subtitle="Review requested shipments and their current status." />

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
                    <span className={statusPillClass(item.status)}>{item.status}</span>
                  </td>
                  <td>{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        </div>
      </section>
    </>
  );
}
