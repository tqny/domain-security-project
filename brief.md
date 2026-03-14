# Project Brief — Brand Protection Control Center

---

## Project Idea

A portfolio-grade web dashboard that simulates the end-to-end workflow of a Brand Protection Program Manager — from threat intake and triage, through investigation and domain management, to vendor enforcement and operational reporting.

---

## Purpose

Demonstrate deep understanding of the brand protection / domain security operations workflow. This is a portfolio piece targeting hiring managers evaluating a program manager / customer success professional with growing AI/agentic engineering skills. It shows the ability to translate a complex real-world operational workflow into a clear, well-built product.

---

## Target User

An internal brand protection / integrity program manager who handles domain enforcement, threat triaging, case investigation, and vendor coordination on behalf of a brand or platform.

---

## Success Criteria

- A reviewer can understand the full brand protection workflow within 60 seconds of landing
- Each page clearly represents a distinct, recognizable stage of the operational workflow
- The design is polished, professional, and portfolio-grade
- Code quality signals strong engineering judgment (clean components, proper types, modular architecture)
- The in-product "About This Project" surface makes the portfolio case without requiring the README

---

## MVP — 5 Lean Pages

Each page represents one workflow stage. "Lean" means: one primary surface, one supporting element, focused interactions — not feature-dense.

1. **Operations Overview** — Operational health at a glance. Key metrics, trend visualization, and a summary of current program state. One composite chart + one support strip.
2. **Case Queue** — Threat intake and triage table. Search, filter, sort. Selecting a case shows a detail panel with metadata, status controls, and notes. This is the daily driver.
3. **Investigation** — Case deep-dive. Signal timeline, evidence links, AI-generated summary, and enforcement readiness. Chart-first layout with supporting context modules.
4. **Domain Portfolio** — Asset management table of monitored domains. Security controls indicators, risk flags, registrar action log. Detail panel on selection.
5. **Enforcement Tracker** — Vendor coordination console. Action pipeline table with SLA tracking, status updates, and coordination notes. Vendor workload summary.

---

## Non-Goals (for MVP)

- No real data ingestion during BUILD phase (seed data only — real data pipeline comes in DATA phase)
- No authentication or multi-user support
- No real AI/ML model integration (AI summaries are static mock content)
- No mobile-first design (desktop-first; responsive is post-MVP polish)
- No campaign clustering, executive PDF reporting, or model monitoring (future roadmap)
- No literal heatmap (tables outperform when data doesn't support 2-axis)

---

## Platform

Desktop-first web application / operational dashboard.

---

## Core User Flow

Threat surfaces → PM triages in **Case Queue** → Deep-dives in **Investigation** → Manages domain assets in **Domain Portfolio** → Coordinates takedown via **Enforcement Tracker** → Reviews operational health in **Overview**.

---

## Data / State Needs

- Static seed data: ~10 cases, ~4 domains, ~4 vendors, ~6 enforcement actions with realistic brand protection scenarios
- Client-side state management (React context + localStorage persistence)
- Data model (carried from prior project, validated during planning):
  - `Case` (id, title, channel, threatType, riskScore, priority, status, owner, summary, aiSummary, notes, timestamps)
  - `Evidence` (id, caseId, type, value, capturedAt)
  - `Domain` (id, domainName, registrar, status, dnsSecurity, riskFlags, actionLog)
  - `Vendor` (id, name, slaHours, region)
  - `EnforcementAction` (id, caseId, vendorId, actionType, status, timestamps, outcome, notes)
- Workflow lifecycle: New → Triaged → Investigating → Enforcement → Closed
- Data model must be designed so seed data and real pipeline data are interchangeable (same TypeScript interfaces)

---

## Auth / Access Needs

None for MVP.

---

## Design Direction

**Fresh direction** — not carrying forward prior project's dark neon aesthetic. Reference images to be provided to establish the new design language.

General portfolio context: the design should feel like a credible internal tool, not a sci-fi concept. Professional, clear, information-dense but not cluttered.

---

## Design References

**To be provided.** Once received:
- Set 1 = style authority
- Additional sets = pattern candidates
- Will be processed through V3's Pass 1 design treatment

---

## "About This Project" Preference

Dedicated page with its own nav item in the sidebar — a first-class reviewer destination, not hidden behind a button. This is a portfolio piece; the reviewer surface deserves the same prominence as any workflow page.

---

## Technical Preferences

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Recommend simplest strong setup (likely Tailwind or CSS Modules — decide during planning)
- **Routing**: React Router (file-based routing not needed for 5 pages)
- **Charting**: Recommend during planning (Recharts is simple; custom SVG if portfolio signal matters more)
- **Deployment**: GitHub Pages (via `gh-pages` or GitHub Actions)
- **State**: React state + context; localStorage persistence (required — prevents broken demo on refresh)

---

## Constraints

- Portfolio-grade polish required
- Desktop-first (responsive is post-MVP)
- No backend — all data is mock/seed for BUILD phase
- Lean pages — each page: one hero surface + one support element, not feature-dense
- Must include in-product "About This Project" surface
- Git repo from day 1, GitHub remote from day 1
- Data model must support future swap from seed data to real pipeline data

---

## Repo / Workflow Preferences

Use the default V3 portfolio workflow: feature branches, PRs before merge, no direct-to-main.

---

## Risks / Known Challenges

- **5 pages is ambitious for "lean"** — need strict feature discipline per page to avoid scope creep
- **Design direction blocked** — fresh design can't proceed past Pass 1 structure until reference images arrive
- **Charting decisions** — React ecosystem has libraries (Recharts, Nivo) that are faster but less portfolio-distinctive than custom SVG
- **Data model complexity** — 5 entity types with cross-references; need clean TypeScript types and a seed data module from day 1
- **Component architecture** — need proper component boundaries planned before building
- **Data pipeline scope** — the DATA phase (real data ingestion) is exciting but could balloon; needs tight scoping during planning

---

## Post-MVP: DATA Phase

After BUILD completes with seed data, a dedicated DATA phase will add real data ingestion:

- **GitHub Actions cron workflow** running on a schedule (daily or weekly)
- Free/public domain security sources: Certificate Transparency logs (crt.sh), DNS resolution, WHOIS data, typosquatting generation, possibly URLScan.io / PhishTank
- Pipeline outputs JSON data files committed to the repo
- React app reads static JSON — no runtime API calls, works with GitHub Pages
- Same TypeScript interfaces as seed data — UI requires zero changes
- This phase gets its own planning pass when we reach it

---

## MVP Delight Touches (from product review)

- **Reset Demo button** — in About page or nav footer. Lets a reviewer reset seed data after exploring. Signals you thought about the demo as a product.
- **Cross-page navigation breadcrumbs** — e.g., "Queue > Case #BG-0042 > Investigation". Makes the workflow feel connected. Shows cross-page data relationships.
- **Nav rail count badges** — subtle count indicators on each nav item (e.g., Queue shows "7" for open cases). The kind of detail real operational tools have and toy demos don't.

---

## Optional Notes

- Prior project at `/Users/tqny/Documents/Meta Project/dashboard/security-suite/` serves as conceptual reference for workflow logic, data model, and feature inventory
- Prior project's docs (spec.md, architecture.md, design.md, decisions.md, panel-audit.md) contain valuable domain knowledge for planning
- Prior project's 11 design decisions (decisions.md) are worth reviewing during architecture planning

---

## Project Lifecycle

```
BRIEF → PLAN → BUILD (seed data) → DATA (real pipeline) → POLISH
```
