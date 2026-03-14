# Architecture — Brand Protection Control Center

> Technical realization of the spec.

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + Vite | Fast dev, component model, ecosystem |
| Language | TypeScript | Type safety, portfolio signal, IDE support |
| Routing | React Router v7 | Simple for 6 routes, no file-based needed |
| State | React Context + localStorage | Lightweight, persistent demo state |
| Styling | TBD (design references pending) | Likely Tailwind or CSS Modules |
| Charting | TBD (during build) | Recharts or custom SVG |
| Deployment | GitHub Pages | Static hosting, GitHub Actions deploy |

## Module Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    App Shell                         │   │
│  │  ┌───────────┐  ┌───────────────────────────────┐   │   │
│  │  │  Nav Rail  │  │       Page Content             │   │   │
│  │  │  (sidebar) │  │    (route-specific view)       │   │   │
│  │  │  + badges  │  │    + breadcrumbs               │   │   │
│  │  └───────────┘  └───────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Data Layer   │  │  Components  │  │  Design System │   │
│  │              │  │              │  │               │   │
│  │  types.ts    │  │  Table       │  │  tokens       │   │
│  │  seed.ts     │  │  DetailPanel │  │  (CSS vars /  │   │
│  │  store.ts    │  │  Chart       │  │   Tailwind)   │   │
│  │  (context +  │  │  FilterBar   │  │               │   │
│  │   persist)   │  │  StatusChip  │  │               │   │
│  │              │  │  Timeline    │  │               │   │
│  │              │  │  KpiCard     │  │               │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Shared Utilities                     │  │
│  │  formatters · filters · sort · SLA calc · dates      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

**Data Layer** — TypeScript interfaces, seed data generator, React context provider, localStorage persistence hook. Single source of truth for all app state.

**Components** — Reusable UI primitives shared across pages. Table, DetailPanel, FilterBar, Chart, StatusChip, Timeline, KpiCard, Breadcrumb, Badge. Built during the first page (Case Queue) and reused thereafter.

**Design System** — Tokens (colors, typography, spacing, radii, shadows, motion), layout primitives, theme configuration. Populated after design references arrive.

**Pages** — Route-specific compositions of components + data. Each page owns its layout, filters, and local UI state (selected row, active filters). Domain state flows from the shared context.

**Shared Utilities** — Pure functions: date formatting, risk score formatting, SLA calculations, filter/sort logic, status helpers.

## Data Flow

```
Seed Data (seed.ts)
       │
       ▼
 Context Provider (store.ts)
   │         │
   ▼         ▼
 Pages    localStorage
   │         │
   ▼         ▼
 Components  Persist/Restore
   │
   ▼
 User interactions → dispatch mutations → context updates → re-render
```

**State shape:**
```typescript
interface AppState {
  cases: Case[]
  evidence: Evidence[]
  domains: Domain[]
  vendors: Vendor[]
  enforcementActions: EnforcementAction[]
  // UI-only (not persisted)
  selectedCaseId: string | null
  selectedDomainId: string | null
  selectedActionId: string | null
}
```

**Mutations** (carried from original, validated during build):
- addCaseNote, setCaseOwner, updateCaseStatus, escalateCasePriority
- createEnforcementAction, updateEnforcementStatus, addEnforcementNote
- addDomainActionLog
- resetToSeedData

## File / Folder Layout

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router + shell layout
├── types/
│   └── index.ts                # All TypeScript interfaces
├── data/
│   ├── seed.ts                 # Seed data generator
│   └── store.tsx               # Context provider + mutations + persistence
├── components/
│   ├── shell/
│   │   ├── NavRail.tsx         # Sidebar navigation + badges
│   │   ├── Breadcrumb.tsx      # Cross-page navigation trail
│   │   └── Layout.tsx          # App shell wrapper
│   ├── shared/
│   │   ├── Table.tsx           # Sortable, filterable data table
│   │   ├── DetailPanel.tsx     # Side panel for selected records
│   │   ├── FilterBar.tsx       # Search + dropdowns + chips
│   │   ├── StatusChip.tsx      # Status/priority badge
│   │   ├── Timeline.tsx        # Chronological event list
│   │   ├── KpiCard.tsx         # Metric display card
│   │   └── Chart.tsx           # Chart wrapper (type TBD)
│   └── pages/
│       ├── Overview.tsx
│       ├── Queue.tsx
│       ├── Investigation.tsx
│       ├── Domains.tsx
│       ├── Enforcement.tsx
│       └── About.tsx
├── utils/
│   ├── formatters.ts           # Date, currency, score formatting
│   ├── filters.ts              # Filter/sort logic
│   └── sla.ts                  # SLA calculation helpers
└── styles/                     # Design tokens + global styles (TBD)
```

## Key Interaction Flows

### Case Flow
Queue → select case → detail panel → update status/owner/notes → navigate to Investigation for deep-dive → create enforcement action

### Domain Flow
Domain Portfolio → select domain → detail panel → view linked cases → add registrar action log → navigate to linked case

### Enforcement Flow
Enforcement Tracker → select action → detail panel → update status/notes → view linked case

### Reporting Flow
Overview aggregates current state from context. No mutations on this page — read-only.

### Cross-Page Navigation
- Breadcrumbs track navigation path (e.g., Queue → Case #BG-0042 → Investigation)
- Linked entity IDs in detail panels are clickable, navigating to the relevant page with that entity selected
- Nav rail badges update reactively from context state

## External Dependencies

Minimal. Expected:
- `react`, `react-dom`, `react-router-dom` — core framework
- `vite` — build tool
- Styling library TBD (Tailwind or CSS Modules)
- Charting library TBD (Recharts or custom)
- `gh-pages` or GitHub Actions — deployment

No backend. No external APIs during BUILD phase.

## Boundaries and Swap Points

| Boundary | What can change without ripple |
|----------|-------------------------------|
| Data source | Swap `seed.ts` for JSON files from pipeline — same interfaces |
| Styling | Swap Tailwind ↔ CSS Modules — components use semantic class names |
| Charting | Swap library — Chart.tsx wrapper isolates the dependency |
| Deployment | Swap GitHub Pages ↔ Vercel — Vite builds static assets either way |
| Pages | Add/remove pages — router config + nav rail, no shared component changes |

## Decisions Carried Forward

From the original project's decision log (2026-03-05), these decisions remain valid:

1. **5-page architecture** — workflow stages are the right pages
2. **Desktop-first** — primary reviewer context
3. **One hero surface per page** + one support element — prevents card fragmentation
4. **No literal heatmap** — table-first for domain data unless real 2-axis model added
5. **No ornamental KPI rows** on operational pages — overview only
6. **Left rail = primary navigation** — no duplicate topbar nav
7. **Data model preserved** — Case, Evidence, Domain, Vendor, EnforcementAction

## Open Items (blocked on design references)

- Styling library choice (Tailwind vs CSS Modules)
- Token system (colors, typography, spacing)
- Layout specifics (exact sidebar width, content max-width, panel proportions)
- Charting approach (library vs custom — depends on design density)
