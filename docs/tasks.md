# Tasks — Brand Protection Control Center

> Execution breakdown. Keep this current — it's the primary continuity document.

<!-- Status markers: [ ] pending, [→] in progress, [x] done, [~] blocked -->

## Current Phase

SHIPPED — All build phases (A–G) and ship phase (D) complete. Live at https://tqny.github.io/domain-security-project/

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

- [x] **D1: GitHub Pages deployment** — GitHub Actions workflow deploys on push to main. Live at https://tqny.github.io/domain-security-project/.
- [x] **D2: Review pass** — Accessibility fixes (aria-labels), removed dead code, owner dropdown imports from store.
- [x] **D3: README** — Full rewrite for scan-first workflow, real enrichment APIs, workflow table, live demo link.

## Build Tasks — Phase E: Dashboard Enhancement (complete)

Imported two shadcnblocks dashboard packages as raw material, then mined them for patterns.

- [x] **E1: Chart palette** — `src/lib/chart-palette.ts` with color-mix derived series colors + shared chart theme.
- [x] **E2: Recharts bar chart** — Replaced CSS bar chart on Overview with Recharts `BarChart` (horizontal layout, custom tooltips).
- [x] **E3: Recharts donut chart** — Replaced CSS conic-gradient with Recharts `PieChart` (active sector highlighting, interactive legend).
- [x] **E4: Enhanced stat cards** — Unified `StatsStrip` with icons, previous-period values, percent change, trend arrows, and dividers.
- [x] **E5: Period tabs** — `PeriodTabs` component on Overview header (7 Days / 30 Days / All Time).
- [x] **E7: AI Insights card** — Prominent amber-accented card with 3 mock AI recommendations, action buttons, "Beta" badge. `AIInsight` type added for DATA phase readiness.
- [x] **E8: Pagination** — Reusable `Pagination` component (page size selector, page numbers, nav buttons).
- [x] **E9: Filter chips** — Active filter chips below FilterBar with individual X clear + "Clear all".
- [x] **E10: Table pagination** — Integrated into Queue, Domains, Enforcement tables.
- [x] **E11: Row action menus** — DropdownMenu on table rows (Investigate, Escalate, Close Case, etc.).
- [x] **E12: StatusChip icons** — Lucide icons for every status type alongside colored dots.
- [x] **E14: Cleanup** — Deleted dashboard1.tsx and dashboard4.tsx source files.
- [x] **E.2a: Threats Detected chart** — Grouped BarChart (FY26 vs FY25) with mock monthly data.
- [x] **E.2b: Threat Channels card** — Channel breakdown with horizontal stacked bar + legend (computed from real seed data).
- [x] **E.2c: About page rebuild** — Hero with icon, workflow strip (Detection → Resolution), demonstrates grid, nav cards, architecture badges, scope decisions, CTA.

## Build Tasks — Phase F: Live Scan + Bridge to Sentinel

Adds a Live Scan page that generates suspicious domain variants, enriches them with public APIs, scores risk, and bridges results into the existing BPCC workflow.

- [x] **F1: Scan types + domain variant engine** — `src/types/scan.ts` (ScanResult, ScanSignal, ScanSession) + `src/lib/scan-engine.ts` (8 generation techniques, Levenshtein similarity, scoring rubric, risk classification, analyst summary).
- [x] **F2: Enrichment pipeline** — `src/lib/enrichment.ts` (DNS via dns.google, RDAP via rdap.org, cert via crt.sh). Batched 4 at a time, 500ms delays, 5s timeouts, graceful fallback on failure.
- [x] **F3: Store mutation** — Added `LOAD_SCAN_DATA` action to store.tsx for full state replacement (bridge writes).
- [x] **F4: Scan bridge** — `src/lib/scan-bridge.ts` maps ScanResult[] → Cases, Domains, Evidence, EnforcementActions. Distributes cases across all 5 workflow statuses for realistic pipeline population.
- [x] **F5: StatusChip risk-level** — Added `risk-level` chip type (Low=green, Medium=amber, High=red) to StatusChip.
- [x] **F6: Routing + navigation** — Route `/live-scan`, NavRail "Tools" section with Radar icon, TopBar breadcrumb.
- [x] **F7: LiveScan page UI** — Scan form, progress bar, summary stat cards, results DataTable with pagination, DetailPanel with signal breakdown and raw evidence, confirmation modal.
- [x] **F8: Wire scan + bridge + export** — Full E2E: scan → enrich → Push to Sentinel → Overview populated. CSV export. AbortController for scan cancellation.
- [x] **F9: Polish** — Live stats during scanning, double-score fix for credential keywords, input validation, empty states.
- [x] **F10: Threat intelligence enrichment** — URLhaus (abuse.ch) + AlienVault OTX + Spamhaus DBL as new enrichment sources. New `threat_intel` evidence type. Intel column in results table. Graceful degradation when API keys not configured. Vite dev proxy for URLhaus (CORS). Spamhaus uses DNS-over-HTTPS (no proxy needed).
- [x] **F11: Smart scan — weighted generation** — Rebalanced variant caps: homoglyphs 6→12, keywords 10→14, TLD 7→9, reduced low-threat techniques (char-del 8→4, char-trans 8→5). Added `.biz`, `.us` to TLD pool.
- [x] **F12: Smart scan — two-pass architecture** — DNS probe phase (8 at a time, 200ms delay) filters to resolving domains before full enrichment. Non-resolving variants get local-only scoring. `ScanPhase` type for progress tracking.
- [x] **F13: Smart scan — funnel progress UX** — `ScanProgress` component shows "Probing DNS... X/Y" → transition message → "Enriching active domains... X/N". Replaces single progress bar.
- [x] **F14: Smart scan — suggested targets** — 10 commonly-attacked brand chips (PayPal, Coinbase, Chase, Microsoft, BofA, Instagram, MetaMask, Amazon, Wells Fargo, Netflix). Click fills input.

## Build Tasks — Phase G: Scan-First Rework + Dashboard Overhaul

Flipped the app workflow: Live Scan is the entry point, no seed data. Workflow pages gated behind scan data. AI triage on the dashboard. Scoring overhaul for realistic differentiation. Dashboard rebuilt with 9 data visualizations. Full animation polish pass.

- [x] **G1: Foundation** — Empty default state, vendors extracted to `src/data/vendors.ts`, `triageStatus` + `scanMeta` added to types, triage actions in store, `seed.ts` deleted.
- [x] **G2: Gating + Navigation** — `RequireScanData` route guard, workflow pages gated, Live Scan promoted to top of nav, "Scan to unlock" hint on disabled items.
- [x] **G3: Scan Bridge Rework** — Two-tier distribution: top 5 = New/pending triage, rest = auto-distributed across Triaged/Investigating/Enforcement. Staggered dates removed. `scanMeta` included.
- [x] **G4: AI Triage on Dashboard** — Interactive one-at-a-time card review with slide animations. Agree auto-creates enforcement action. Manual Review flags for human. Progress bar with pulsing active segment. Resolved items in compact list.
- [x] **G5: Dashboard Rethink** — Removed PeriodTabs, ThreatsTrendChart, mockInsights. Added: Scan Summary Banner, simplified StatsStrip, dynamic AI Triage, Risk Distribution, Scan Funnel, Signal Coverage Radar, Vendor Enforcement Pipeline, Evidence Sources, Risk vs Similarity Scatter, Attack Vectors donut, Recent Activity.
- [x] **G6: Scoring Overhaul** — Compound signal bonuses (DNS+cert, DNS+cert+recent, homoglyph+DNS, keyword+DNS, etc.). Boosted keyword/similarity contributions. Lowered High threshold to 55. Signal-aware `getRecommendedAction` with ~8 distinct recommendations. Richer `generateAnalystSummary` with varied lead sentences. Synthetic threat intel for domains with strong real signals but no API keys.
- [x] **G7: Variant cap** — Reduced from 80 to 20 variants, prioritizing high-threat methods (homoglyphs, keywords) over low-threat ones.
- [x] **G8: Enrichment ticker** — Rotating status ticker during scan showing enrichment pipeline steps (DNS, RDAP, crt.sh, Spamhaus, URLhaus, OTX, similarity, keyword analysis, compound scoring, AI summaries) with fade-slide animation.
- [x] **G9: Sample data** — Pre-built `sample-scan.ts` with 15 results for quick-load demo. "Load sample data" button on Live Scan empty state.
- [x] **G10: About page update** — Rewrote hero, workflow strip, demonstrates section, what to look at, architecture, scope decisions, and CTA for scan-first workflow. Context-aware CTA (scan vs dashboard). "Clear Data" replaces "Reset Demo".
- [x] **G11: Animation polish** — Count-up stat numbers, staggered funnel bars, Recharts mount animations, bar hover effects (activeBar), donut interactive legends (scale+glow), Risk Distribution hover tracking, Scan Funnel bar grow+glow on hover, Recent Activity staggered entrance + hover accent bar, stat card hover lift + accent bar, AI Triage card entrance + progress pulse + button glow, NavRail logo/user block hover effects.
- [x] **G12: Cleanup** — Deleted `PeriodTabs.tsx`, deleted `seed.ts`. Updated docs.

---

## Significant Mid-Build Changes

- **Design system refresh** — Replaced "Warm Contrast Analytics" (warm-tinted oklch grays, framed amber shell) with "Torch Dark Gold" (neutral hex grays, flat sidebar+topbar grid). New criteria files at `~/Desktop/domain new/`. All tokens rewritten in `global.css`.
- **Brand target change** — Replaced fictional "Acme Corp" with Bank of America in all seed data. Enables real domain scanning in future DATA phase (crt.sh, DNS, WHOIS against BofA typosquats).
- **Layout restructure** — Removed amber canvas frame. Now full-viewport CSS Grid: 260px sidebar + 64px topbar + scrollable main. Added TopBar component, evolved NavRail into full sidebar with icons, sections, logo, user block.
- **Charting upgrade (Phase E)** — Replaced CSS-based charts with Recharts (BarChart, PieChart, grouped bars). Added shadcn ChartContainer/ChartConfig for theming. Added chart-palette.ts for color-mix derived series colors.
- **Dashboard import (Phase E)** — Imported shadcnblocks dashboard1 + dashboard4 as raw material. Extracted patterns (pagination, filter chips, stat cards, row actions, status icons, chart tooltips). Deleted source files after extraction.
- **Scan-first rework (Phase G)** — Removed seed data entirely. Live Scan is the entry point; workflow pages gated behind scan data. AI triage on dashboard (one-at-a-time cards). Scoring overhauled with compound bonuses and synthetic threat intel. Dashboard rebuilt with 9 visualizations (bars, donuts, radar, scatter). Full animation polish pass across all components.

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
