# Brand Protection Control Center

A portfolio-grade dashboard simulating the end-to-end workflow of a Brand Protection Program Manager — threat intake, investigation, domain management, vendor enforcement, and operational reporting.

## What This Is

A desktop-first web application built with React, TypeScript, and Vite that demonstrates how brand protection operations actually work: threats are identified, triaged into cases, investigated for evidence, coordinated with enforcement vendors, and tracked through resolution.

This is not a tutorial project. It simulates a real operational workflow with realistic data, cross-entity relationships, and the kind of information density that actual internal tools require.

## Why It Exists

Built as a portfolio artifact to demonstrate:
- Deep understanding of brand protection / domain security operations
- Ability to translate complex workflows into clear, usable product surfaces
- Engineering judgment: clean React/TypeScript architecture, modular components, typed data model
- AI-assisted development fluency

Part of [Tony Mikityuk's portfolio](https://tqny.github.io/Tony-s-Site/).

## What's In v1

- **5 workflow pages**: Operations Overview, Case Queue, Investigation, Domain Portfolio, Enforcement Tracker
- **Interactive demo data**: ~10 cases, domains, vendors, and enforcement actions with full lifecycle
- **Cross-page navigation**: Breadcrumbs, linked entities, nav badges with live counts
- **In-product About page**: Explains the project without requiring this README

## Tech Stack

- React 19 + Vite + TypeScript
- React Router for navigation
- React Context + localStorage for state persistence
- Deployed to GitHub Pages

## Running Locally

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── types/          # TypeScript interfaces
├── data/           # Seed data + state management
├── components/
│   ├── shell/      # Nav rail, breadcrumb, layout
│   ├── shared/     # Table, DetailPanel, FilterBar, Chart, etc.
│   └── pages/      # One component per route
├── utils/          # Formatters, filters, SLA calculations
└── styles/         # Design tokens + global styles
```

---

*Work in progress. See `docs/tasks.md` for current status.*
