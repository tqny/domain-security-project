# Brand Protection Control Center

A portfolio-grade dashboard simulating the end-to-end workflow of a Brand Protection Program Manager — threat intake, investigation, domain management, vendor enforcement, and operational reporting — on behalf of Bank of America.

## What This Is

A desktop-first web application built with React, TypeScript, and Vite that demonstrates how brand protection operations actually work: threats are identified, triaged into cases, investigated for evidence, coordinated with enforcement vendors, and tracked through resolution.

This is not a tutorial project. It simulates a real operational workflow with realistic data targeting a real brand, cross-entity relationships, and the kind of information density that actual internal tools require.

## Why It Exists

Built as a portfolio artifact to demonstrate:
- Deep understanding of brand protection / domain security operations
- Ability to translate complex workflows into clear, usable product surfaces
- Engineering judgment: clean React/TypeScript architecture, modular components, typed data model
- AI-assisted development fluency (built with Claude Code)

Part of [Tony Mikityuk's portfolio](https://tqny.github.io/Tony-s-Site/).

## What's In v1

- **Operations Overview** — Stat cards, case pipeline chart, threat distribution donut, recent activity
- **Case Queue** — Searchable/filterable threat intake table with detail panels, status controls, notes
- **Investigation** — Case deep-dive with signal timeline, evidence, AI analysis, decision controls
- **Domain Portfolio** — Monitored domains with security indicators, risk flags, registrar action logs
- **Enforcement Tracker** — Vendor coordination with SLA tracking, status controls, workload summary
- **About This Project** — In-product reviewer page with workflow explanation and Reset Demo
- **Cross-page navigation** — Linked entities, breadcrumbs, nav badges with live counts

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui (Torch Dark Gold design system)
- React Router v7 for navigation
- React Context + localStorage for state persistence
- CSS-based charts (no charting library)
- Lucide React for icons, Geist for typography

## Running Locally

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── types/          # TypeScript interfaces (Case, Domain, Vendor, etc.)
├── data/           # Seed data (BofA threats) + state management
├── components/
│   ├── shell/      # Sidebar, TopBar, Layout (CSS Grid)
│   ├── shared/     # DataTable, DetailPanel, FilterBar, StatusChip
│   └── pages/      # One component per route
└── styles/         # Torch Dark Gold design tokens
```

---

*See `docs/tasks.md` for build status. See the in-product About page for full project context.*
