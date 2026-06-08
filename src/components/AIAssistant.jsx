import EmptyState from "./EmptyState";
import { SparkIcon, ArrowRightIcon } from "./icons/Icons";

export default function AIAssistant({ suggestions, onApprove, onDismiss }) {
  return (
    <div className="ai-hero">
      <div className="ai-hero-head">
        <span className="ai-glyph">
          <SparkIcon size={18} />
        </span>
        <div>
          <span className="ai-eyebrow">Smart suggestions</span>
          <h3>AI Assistant</h3>
        </div>
      </div>
      <p className="ai-hero-sub">Recommended moves to rebalance stock from recent sales and inventory signals.</p>

      {suggestions.length === 0 ? (
        <EmptyState
          title="You're all balanced"
          message="No rebalancing suggestions right now. New ones appear here as sales data comes in."
        />
      ) : (
        <div className="ai-suggestions">
          {suggestions.map((s, i) => (
            <div key={i} className="ai-suggestion">
              <div className="ai-suggestion-body">
                <div className="ai-suggestion-title">
                  <strong>{s.product}</strong>
                  <span className="ai-qty">{s.qty} units</span>
                </div>
                <div className="ai-route">
                  <span>{s.from}</span>
                  <ArrowRightIcon size={14} />
                  <span>{s.to}</span>
                </div>
              </div>
              <div className="ai-suggestion-actions">
                <button type="button" className="btn btn-sm" onClick={() => onApprove(s)}>
                  Approve
                </button>
                {onDismiss && (
                  <button type="button" className="btn-ghost btn-sm" onClick={() => onDismiss(s)}>
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
