# Tasks — Brand Protection Control Center

> Execution breakdown. Keep this current — it's the primary continuity document.

<!-- Status markers: [ ] pending, [→] in progress, [x] done, [~] blocked -->

## Current Phase

BUILD — Phase D (Ship)

## Lifecycle

```
BRIEF → PLAN → BUILD (seed data) → DATA (real pipeline) → POLISH
```

---

## Planning Tasks

- [x] Complete project brief (`brief.md`)
- [x] Run product review (`/plan-product-review`)
- [x] Draft spec.md
- [x] Draft architecture.md
- [x] Draft tasks.md (this file)
- [x] Draft design.md Pass 1
- [x] Draft README.md
- [ ] Run `/plan-eng-review` — lock in architecture with diagrams and edge cases
- [x] Initialize GitHub remote

---

## Build Tasks — Phase A: Foundation

- [x] **A1: Project scaffold** — Vite + React + TypeScript + React Router v7 + Tailwind v4 + shadcn/ui. Dev server verified.
- [x] **A2: TypeScript data model** — All 5 entity types + enums + state shape in `src/types/index.ts`.
- [x] **A3: Seed data** — ~10 cases, ~4 domains, ~4 vendors, ~7 actions, evidence in `src/data/seed.ts`.
- [x] **A4: State management** — React context + localStorage persistence + reset function in `src/data/store.tsx`.
- [x] **A5: Design system foundation** — Torch Dark Gold tokens mapped into `src/styles/global.css`. Neutral grays, amber accent, Geist font. Design criteria files at `~/Desktop/domain new/`.
- [x] **A6: App shell** — Router (6 routes), sidebar with icons/sections/user block + topbar with breadcrumb/search. CSS Grid layout.

## Build Tasks — Phase B: Pages (build order)

Each page: implement primary surface + support element + interactions. Verify before moving on.

B1 establishes shared component patterns (table, detail panel, filter bar, status chips) that B2–B5 reuse.

- [x] **B1: Case Queue** — Table with search/filter/sort. Detail panel with status controls, owner, notes. Linked domain navigates to Domains page.
- [x] **B2: Investigation** — Case selector (supports `?case=` deep linking), signal timeline, evidence list, AI summary, decision module, risk assessment bar.
- [x] **B3: Domain Portfolio** — Domain table with search/filter/sort. Detail panel with security controls (DNSSEC/registry lock/WHOIS privacy icons), risk flags, linked cases (clickable → Investigation), registrar action log with add-entry form.
- [x] **B4: Enforcement Tracker** — Action table with vendor/status/type filters. Detail panel with SLA tracking (progress bar, time remaining, breach indicators), status controls, notes. Vendor workload summary (4-card grid). Linked case clickable → Investigation.
- [x] **B5: Operations Overview** — 4 stat cards (open cases, active threats, domains monitored, pending actions) with trend badges. Case pipeline horizontal bar chart (CSS-based). Threat type donut chart (CSS conic-gradient). Recent case activity list. Read-only — no mutations.

## Build Tasks — Phase C: Portfolio Surface

- [x] **C1: About This Project page** — Full reviewer-facing content: positioning, workflow explanation (detect → triage → investigate → enforce → resolve), architecture overview, scope decisions, how to explore. Reset Demo button with confirmation dialog. Portfolio footer link.
- [x] **C2: Cross-page navigation** — TopBar breadcrumb (Home / page name). Linked cases in Domains and Enforcement detail panels navigate to Investigation via `?case=` param. Linked domain in Queue detail panel navigates to Domains.
- [x] **C3: Nav rail badges** — Live count indicators: open cases, investigating, domains, active enforcement actions. Badges update reactively from context state. Wired during sidebar rebuild.
- [x] **C4: Reset Demo** — Button on About page. Calls `resetToSeedData()` with `window.confirm` guard. Restores localStorage to seed state.

## Build Tasks — Phase D: Ship

- [ ] **D1: GitHub Pages deployment** — GitHub Actions workflow or gh-pages. Done: live at GitHub Pages URL.
- [ ] **D2: Review pass** — Run `/review` and `/browse`. Fix any critical issues.
- [ ] **D3: README** — Finalize README.md for repo visitors. Done: clear, concise, links to live demo.

---

## Significant Mid-Build Changes

- **Design system refresh** — Replaced "Warm Contrast Analytics" (warm-tinted oklch grays, framed amber shell) with "Torch Dark Gold" (neutral hex grays, flat sidebar+topbar grid). New criteria files at `~/Desktop/domain new/`. All tokens rewritten in `global.css`.
- **Brand target change** — Replaced fictional "Acme Corp" with Bank of America in all seed data. Enables real domain scanning in future DATA phase (crt.sh, DNS, WHOIS against BofA typosquats).
- **Layout restructure** — Removed amber canvas frame. Now full-viewport CSS Grid: 260px sidebar + 64px topbar + scrollable main. Added TopBar component, evolved NavRail into full sidebar with icons, sections, logo, user block.
- **Charting** — No external library. Overview uses CSS-based charts (horizontal bars via width%, donut via conic-gradient).

---

## DATA Phase Tasks (post-BUILD)

_To be planned in detail when BUILD is complete. High-level:_

- [ ] Plan data pipeline architecture
- [ ] Implement GitHub Actions cron workflow
- [ ] Certificate Transparency log ingestion (crt.sh)
- [ ] DNS resolution checks
- [ ] WHOIS data pulls
- [ ] Typosquatting domain generation (bankofamerica.com, bofa.com, merrilledge.com variants)
- [ ] Output JSON data files to repo
- [ ] Swap app data source from seed.ts to pipeline JSON

---

## POLISH Phase Tasks (post-DATA)

_To be planned when DATA is complete. High-level:_

- [ ] Responsive design pass
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Final design convergence
- [ ] README final pass
