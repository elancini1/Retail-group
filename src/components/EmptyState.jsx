export default function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {message && <p className="muted">{message}</p>}
    </div>
  );
}
