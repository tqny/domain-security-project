# Tasks — Brand Protection Control Center

> Execution breakdown. Keep this current — it's the primary continuity document.

<!-- Status markers: [ ] pending, [→] in progress, [x] done, [~] blocked -->

## Current Phase

BUILD — Phase B (Pages)

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
- [ ] Initialize GitHub remote

---

## Build Tasks — Phase A: Foundation

- [x] **A1: Project scaffold** — Vite + React + TypeScript + React Router v7 + Tailwind v4 + shadcn/ui. Dev server verified.
- [x] **A2: TypeScript data model** — All 5 entity types + enums + state shape in `src/types/index.ts`.
- [x] **A3: Seed data** — ~10 cases, ~4 domains, ~4 vendors, ~6 actions, evidence in `src/data/seed.ts`.
- [x] **A4: State management** — React context + localStorage persistence + reset function in `src/data/store.tsx`.
- [x] **A5: Design system foundation** — Warm Contrast Analytics tokens mapped into `src/styles/global.css`. Amber accent, dark shell on warm canvas. Geist font. Design criteria files at `~/Desktop/domain design criteria/`.
- [x] **A6: App shell** — Router (6 routes), nav rail with workflow labels + count badges, framed layout (dark rounded shell on amber canvas). All routes render placeholder pages.

## Build Tasks — Phase B: Pages (build order)

Each page: implement primary surface + support element + interactions. Verify before moving on.

B1 establishes shared component patterns (table, detail panel, filter bar, status chips) that B2–B5 reuse.

- [x] **B1: Case Queue** — Table with search/filter/sort/pagination. Detail panel with status controls, owner, notes. Done: can search, filter, sort cases. Selecting a case shows detail. Can update status and add notes.
- [x] **B2: Investigation** — Case selector, signal chart, evidence list, AI summary, decision module, timeline. Done: selecting a case shows full investigation view with chart + context + actions.
- [ ] **B3: Domain Portfolio** — Domain table with search/filter. Detail panel with security controls, risk flags, linked cases, registrar log. Done: can browse domains, view detail, add log entries.
- [ ] **B4: Enforcement Tracker** — Action table with vendor/status filters. Detail panel with SLA tracking, status controls, notes. Vendor workload summary. Done: can filter actions, update status, see SLA breach indicators.
- [ ] **B5: Operations Overview** — Composite trend chart, threat distribution, program health summary. Done: overview renders aggregate data from context. Read-only — no mutations.

## Build Tasks — Phase C: Portfolio Surface

- [ ] **C1: About This Project page** — Content: positioning, workflow explanation, architecture, scope decisions, how to evaluate. Done: page renders with structured content, accessible from nav.
- [ ] **C2: Cross-page breadcrumbs** — Breadcrumb trail tracks navigation. Linked entities navigate to relevant pages. Done: clicking a case in Domains navigates to Investigation with that case selected.
- [ ] **C3: Nav rail badges** — Live count indicators per workflow stage. Done: badges update reactively as state changes.
- [ ] **C4: Reset Demo** — Button in About page and/or nav footer. Resets state to seed data. Done: click resets, confirmation prompt prevents accidents.

## Build Tasks — Phase D: Ship

- [ ] **D1: GitHub Pages deployment** — GitHub Actions workflow or gh-pages. Done: live at GitHub Pages URL.
- [ ] **D2: Review pass** — Run `/review` and `/browse`. Fix any critical issues.
- [ ] **D3: README** — Finalize README.md for repo visitors. Done: clear, concise, links to live demo.

---

## DATA Phase Tasks (post-BUILD)

_To be planned in detail when BUILD is complete. High-level:_

- [ ] Plan data pipeline architecture
- [ ] Implement GitHub Actions cron workflow
- [ ] Certificate Transparency log ingestion (crt.sh)
- [ ] DNS resolution checks
- [ ] WHOIS data pulls
- [ ] Typosquatting domain generation
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
