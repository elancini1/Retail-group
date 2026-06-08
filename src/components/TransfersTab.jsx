import EmptyState from "./EmptyState";
import BarChart from "./charts/BarChart";

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
        <div className="section-heading">
          <div>
            <h3>Transfer requests</h3>
            <p className="muted">Review requested shipments and their current status.</p>
          </div>
        </div>
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
      <section className="transfer-metrics">
        <div className="stat-card">
          <div className="stat-label">Total transfers</div>
          <div className="stat-value">{transfers.length}</div>
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
            <h3>Transfers by status</h3>
            <p className="muted">Distribution of all requests across their current status.</p>
          </div>
        </div>
        <BarChart data={statusBreakdown} />
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
        <div className="section-heading">
          <div>
            <h3>Transfer status timeline</h3>
            <p className="muted">Track the current shipment progress through every stage.</p>
          </div>
        </div>

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
