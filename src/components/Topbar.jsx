import ThemeToggle from "./ThemeToggle";
import { LogoMark, BellIcon, GridIcon, BoxIcon, TransferIcon, SparkIcon, SettingsIcon } from "./icons/Icons";

const TABS_ICONS = {
  Dashboard: GridIcon,
  Inventory: BoxIcon,
  Transfers: TransferIcon,
  Insights: SparkIcon,
  Settings: SettingsIcon,
};

export default function Topbar({ tabs, activeTab, onSelect, theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <LogoMark />
        </span>
        <span className="brand-name">Relay</span>
      </div>

      <nav className="topbar-nav" aria-label="Primary">
        {tabs.map((tab) => {
          const Icon = TABS_ICONS[tab];
          return (
            <button
              key={tab}
              type="button"
              className={`nav-tab ${activeTab === tab ? "active" : ""}`}
              aria-current={activeTab === tab ? "page" : undefined}
              onClick={() => onSelect(tab)}
            >
              {Icon && <Icon size={17} />}
              <span>{tab}</span>
            </button>
          );
        })}
      </nav>

      <div className="topbar-actions">
        <span className="icon-chip" aria-hidden="true">
          <BellIcon size={18} />
        </span>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <span className="avatar" aria-hidden="true">R</span>
      </div>
    </header>
  );
}
