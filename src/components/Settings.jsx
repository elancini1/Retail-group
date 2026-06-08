import { useState } from "react";
import usePersistentState from "../hooks/usePersistentState";
import SectionHeader from "./SectionHeader";
import { BuildingIcon, StoreIcon, BellIcon, SettingsIcon } from "./icons/Icons";

const MOCK_COMPANY = {
  name: "Retail Group Inc.",
  industry: "Apparel & Fashion",
  currency: "USD",
  timezone: "America/New_York",
};

const MOCK_STORES = [
  { id: "s1", name: "Downtown Store", location: "Main Street", active: true },
  { id: "s2", name: "Uptown Store", location: "Mall Plaza", active: true },
  { id: "s3", name: "Suburban Store", location: "Route 9 Strip", active: false },
];

const MOCK_NOTIFICATIONS = {
  lowStock: true,
  transferApprovals: true,
  aiRecommendations: false,
  weeklyDigest: true,
};

const MOCK_PREFS = {
  density: "Default",
  language: "English",
};

const NOTIF_ITEMS = [
  {
    key: "lowStock",
    label: "Low stock alerts",
    desc: "Notify when an item drops below its reorder threshold",
  },
  {
    key: "transferApprovals",
    label: "Transfer approvals",
    desc: "Notify when a transfer request needs your sign-off",
  },
  {
    key: "aiRecommendations",
    label: "AI recommendations",
    desc: "Receive AI-generated restock suggestions as they are produced",
  },
  {
    key: "weeklyDigest",
    label: "Weekly performance digest",
    desc: "Summary of sales and inventory trends every Monday",
  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`settings-toggle${checked ? " on" : ""}`}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

const DEFAULT_SETTINGS = {
  company: MOCK_COMPANY,
  stores: MOCK_STORES,
  notifs: MOCK_NOTIFICATIONS,
  prefs: MOCK_PREFS,
};

export default function Settings() {
  // `saved` is the persisted snapshot; `draft` holds unsaved edits.
  const [saved, setSaved] = usePersistentState("settings", DEFAULT_SETTINGS);
  const [draft, setDraft] = useState(saved);
  const [justSaved, setJustSaved] = useState(false);

  const { company, stores, notifs, prefs } = draft;
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const setCompany = (next) => update({ company: next });
  const setNotifs = (next) => update({ notifs: next });
  const setPrefs = (next) => update({ prefs: next });

  const handleSave = () => {
    setSaved(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDiscard = () => setDraft(saved);

  const toggleStore = (id) =>
    update({ stores: stores.map((s) => (s.id === id ? { ...s, active: !s.active } : s)) });

  return (
    <>
      <section className="card section-card">
        <SectionHeader icon={BuildingIcon} title="Company Information" subtitle="Basic details about your organization." />
        <div className="settings-form-grid">
          <label className="settings-field">
            <span className="settings-label">Company name</span>
            <input
              className="search-input settings-input"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
            />
          </label>
          <label className="settings-field">
            <span className="settings-label">Industry</span>
            <select
              className="search-input settings-input"
              value={company.industry}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
            >
              <option>Apparel &amp; Fashion</option>
              <option>Electronics</option>
              <option>Grocery &amp; Food</option>
              <option>Home &amp; Garden</option>
              <option>Sporting Goods</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-label">Currency</span>
            <select
              className="search-input settings-input"
              value={company.currency}
              onChange={(e) => setCompany({ ...company, currency: e.target.value })}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>CAD</option>
            </select>
          </label>
          <label className="settings-field">
            <span className="settings-label">Timezone</span>
            <select
              className="search-input settings-input"
              value={company.timezone}
              onChange={(e) => setCompany({ ...company, timezone: e.target.value })}
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card section-card">
        <SectionHeader
          icon={StoreIcon}
          title="Store Management"
          subtitle="Manage the stores connected to your account."
          action={<button className="btn">+ Add store</button>}
        />
        <div className="settings-row-list">
          {stores.map((store) => (
            <div key={store.id} className="settings-list-row">
              <div>
                <strong>{store.name}</strong>
                <p className="muted" style={{ margin: 0 }}>{store.location}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  className={`status-chip ${store.active ? "status-approved" : "status-reconciled"}`}
                >
                  {store.active ? "Active" : "Inactive"}
                </span>
                <Toggle checked={store.active} onChange={() => toggleStore(store.id)} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <SectionHeader icon={BellIcon} title="Notification Settings" subtitle="Choose which events trigger alerts for your team." />
        <div className="settings-row-list">
          {NOTIF_ITEMS.map(({ key, label, desc }) => (
            <div key={key} className="settings-list-row">
              <div>
                <strong>{label}</strong>
                <p className="muted" style={{ margin: 0 }}>{desc}</p>
              </div>
              <Toggle
                checked={notifs[key]}
                onChange={(val) => setNotifs({ ...notifs, [key]: val })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card section-card">
        <SectionHeader icon={SettingsIcon} title="User Preferences" subtitle="Customize your personal dashboard experience." />
        <div className="settings-form-grid">
          <div className="settings-field">
            <span className="settings-label">Table density</span>
            <div className="filter-group">
              {["Compact", "Default", "Comfortable"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`filter-button${prefs.density === opt ? " active" : ""}`}
                  onClick={() => setPrefs({ ...prefs, density: opt })}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <label className="settings-field">
            <span className="settings-label">Language</span>
            <select
              className="search-input settings-input"
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </label>
        </div>
      </section>

      <div className="settings-save-bar">
        <button type="button" className="filter-button" onClick={handleDiscard}>
          Discard changes
        </button>
        <button type="button" className="btn" onClick={handleSave}>
          {justSaved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </>
  );
}
