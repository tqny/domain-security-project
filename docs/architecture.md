# Architecture — Brand Protection Control Center

> Technical realization of the spec.

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + Vite | Fast dev, component model, ecosystem |
| Language | TypeScript | Type safety, portfolio signal, IDE support |
| Routing | React Router v7 | Simple for 6 routes, no file-based needed |
| State | React Context + localStorage | Lightweight, persistent demo state |
| Styling | Tailwind CSS v4 + shadcn/ui | Token-based design system, utility classes |
| Charting | CSS-based (no library) | Horizontal bars via width%, donut via conic-gradient |
| Deployment | GitHub Pages | Static hosting, GitHub Actions deploy |

## Module Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        React App                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    App Shell (CSS Grid)              │   │
│  │  ┌───────────┐  ┌───────────────────────────────┐   │   │
│  │  │  Sidebar   │  │  TopBar (breadcrumb + search)  │   │   │
│  │  │  260px     │  ├───────────────────────────────┤   │   │
│  │  │  icons     │  │  Page Content                  │   │   │
│  │  │  badges    │  │  (route-specific view)         │   │   │
│  │  │  user      │  │                                │   │   │
│  │  └───────────┘  └───────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Data Layer   │  │  Components  │  │  Design System │   │
│  │              │  │              │  │               │   │
│  │  types.ts    │  │  DataTable   │  │  Torch Dark   │   │
│  │  seed.ts     │  │  DetailPanel │  │  Gold tokens  │   │
│  │  store.tsx   │  │  FilterBar   │  │  (CSS vars +  │   │
│  │  (context +  │  │  StatusChip  │  │   Tailwind)   │   │
│  │   persist)   │  │  StatCard    │  │               │   │
│  │              │  │  Charts      │  │               │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

**Data Layer** — TypeScript interfaces, seed data generator (BofA-targeted threats), React context provider, localStorage persistence hook. Single source of truth for all app state.

**Components** — Reusable UI primitives shared across pages. DataTable, DetailPanel, FilterBar, StatusChip. Built during B1 (Case Queue) and reused by all subsequent pages.

**Design System** — Torch Dark Gold tokens (colors, typography, spacing, radii, shadows, motion) in `src/styles/global.css`, consumed via Tailwind utility classes and shadcn/ui components.

**Pages** — Route-specific compositions of components + data. Each page owns its layout, filters, and local UI state (selected row, active filters). Domain state flows from shared context.

**Shell** — Sidebar (NavRail.tsx) with icons, section labels, badges, user block. TopBar (TopBar.tsx) with breadcrumb and search. Layout.tsx wires CSS Grid.

## Data Flow

```
Seed Data (seed.ts)
       │
       ▼
 Context Provider (store.tsx)
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
}
```

**Mutations:**
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
│   ├── seed.ts                 # Seed data generator (BofA threats)
│   └── store.tsx               # Context provider + mutations + persistence
├── components/
│   ├── shell/
│   │   ├── NavRail.tsx         # Sidebar: logo, nav sections, icons, badges, user block
│   │   ├── TopBar.tsx          # TopBar: breadcrumb, search, notifications
│   │   └── Layout.tsx          # CSS Grid shell (sidebar + topbar + main)
│   ├── shared/
│   │   ├── DataTable.tsx       # Generic sortable data table
│   │   ├── DetailPanel.tsx     # Right-side detail panel overlay
│   │   ├── FilterBar.tsx       # Search + dropdown filters
│   │   └── StatusChip.tsx      # Status/priority/domain/action badges
│   └── pages/
│       ├── Overview.tsx        # Stat cards, charts, recent activity
│       ├── Queue.tsx           # Case table + detail panel
│       ├── Investigation.tsx   # Case deep-dive (timeline, evidence, AI, decisions)
│       ├── Domains.tsx         # Domain table + detail panel
│       ├── Enforcement.tsx     # Action table + detail panel + vendor summary
│       └── About.tsx           # Portfolio reviewer page + reset demo
└── styles/
    └── global.css              # Torch Dark Gold design tokens
```

## Key Interaction Flows

### Case Flow
Queue → select case → detail panel → update status/owner/notes → click linked domain → Domains page. Or: navigate to Investigation for deep-dive.

### Investigation Flow
Investigation → select case (or arrive via `?case=` deep link from another page) → view timeline, evidence, AI analysis → update status → view enforcement actions.

### Domain Flow
Domain Portfolio → select domain → detail panel → view security controls, risk flags → click linked case → navigates to Investigation with that case selected.

### Enforcement Flow
Enforcement Tracker → select action → detail panel → view SLA tracking → update status/notes → click linked case → navigates to Investigation.

### Reporting Flow
Overview aggregates current state from context. No mutations on this page — read-only. Stat cards, pipeline chart, threat donut, recent activity.

### Cross-Page Navigation
- TopBar breadcrumb shows `Home / {page name}` on every page
- Linked entity IDs in detail panels are clickable, navigating to the relevant page with query params
- Nav sidebar badges update reactively from context state

## External Dependencies

Minimal:
- `react`, `react-dom`, `react-router-dom` — core framework
- `vite` — build tool
- `tailwindcss`, `@tailwindcss/vite` — styling
- `class-variance-authority`, `radix-ui` — shadcn/ui primitives
- `lucide-react` — icons
- `@fontsource-variable/geist` — typography

No backend. No external APIs during BUILD phase. No charting library.

## Boundaries and Swap Points

| Boundary | What can change without ripple |
|----------|-------------------------------|
| Data source | Swap `seed.ts` for JSON files from pipeline — same interfaces |
| Styling | Tokens in `global.css` control all colors — one-file swap |
| Charting | CSS-based charts can be replaced with Recharts — contained in Overview |
| Deployment | Swap GitHub Pages ↔ Vercel — Vite builds static assets either way |
| Pages | Add/remove pages — router config + sidebar, no shared component changes |
| Brand target | Swap seed data brand — entity types are brand-agnostic |
