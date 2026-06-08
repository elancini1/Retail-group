export default function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="section-header">
      <div className="section-header-main">
        {Icon && (
          <span className="section-header-icon">
            <Icon size={16} />
          </span>
        )}
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
