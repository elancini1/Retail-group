# Retail Transfer Dashboard

A React + Vite dashboard for managing inventory and stock transfers across
multiple retail store locations. It surfaces low-stock alerts, lets you
approve AI-suggested rebalancing transfers, and tracks each shipment through
its lifecycle.

> **Status:** MVP / prototype. Runs entirely on mock data (`src/data/mockData.js`)
> with state persisted to `localStorage` — there is no backend yet.

## Features

- **Dashboard** — summary stats, per-store overview, and stock imbalance alerts.
- **Inventory** — searchable, filterable product table across all stores with
  low-stock / healthy status.
- **Transfers** — transfer request table plus a 5-stage status timeline
  (Requested → Approved → In Transit → Received → Reconciled).
- **Insights** — AI-style recommendations, risk alerts, and a mock advisor chat.
- **Settings** — company info, store management, notifications, and preferences
  with Save / Discard semantics.
- **AI Assistant side panel** — approve suggested transfers; approvals flow into
  the transfer list and persist across reloads.
- Responsive down to mobile, with empty states throughout.

## Tech stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/) for dev server and build
- [ESLint](https://eslint.org/) (flat config)
- [Playwright](https://playwright.dev/) for end-to-end tests

## Getting started

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
```

## Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `npm run dev`      | Start the Vite dev server       |
| `npm run build`    | Production build to `dist/`     |
| `npm run preview`  | Preview the production build    |
| `npm run lint`     | Run ESLint                      |
| `npm run test:e2e` | Run Playwright end-to-end tests |

### Running the E2E tests

The first time, install the browser binary:

```bash
npx playwright install chromium
npm run test:e2e
```

## Project structure

```
src/
├── App.jsx                    # App shell: tabs, shared state, side panel
├── data/mockData.js           # Seed data (stores, suggestions, transfers, insights)
├── hooks/
│   └── usePersistentState.js  # localStorage-backed useState
└── components/
    ├── Header.jsx
    ├── DashboardTab.jsx
    ├── InventoryTab.jsx
    ├── TransfersTab.jsx
    ├── InsightsTab.jsx
    ├── Settings.jsx
    ├── StoreOverview.jsx
    ├── Alerts.jsx
    ├── AIAssistant.jsx
    ├── TransferTracking.jsx
    └── EmptyState.jsx
tests/
└── smoke.spec.js              # Playwright smoke tests
```
