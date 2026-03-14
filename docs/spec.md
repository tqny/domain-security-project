# Spec — Brand Protection Control Center

> Primary product truth. All other docs derive from this.

## Product

A portfolio-grade web dashboard that simulates the end-to-end workflow of a Brand Protection Program Manager — from threat intake and triage, through investigation and domain management, to vendor enforcement and operational reporting.

The product should do two things well:

1. **Teach the workflow** clearly enough that a reviewer can understand how threats are identified, triaged, investigated, enforced, and reported.
2. **Demonstrate engineering judgment** through a polished React/TypeScript codebase with clean architecture, proper typing, and modular components.

## Target User

Internal brand protection / integrity program manager handling domain enforcement, threat triaging, case investigation, and vendor coordination on behalf of a brand or platform.

For portfolio context: the real audience is a hiring manager evaluating a PM/CS professional with growing AI/agentic engineering skills. The simulated user provides the domain framing; the hiring manager is who we're impressing.

## Success Criteria

- A reviewer can understand the full brand protection workflow within 60 seconds of landing
- Each page clearly represents a distinct, recognizable stage of the operational workflow
- The design is polished, professional, and portfolio-grade
- Code quality signals strong engineering judgment (clean components, proper types, modular architecture)
- The in-product "About This Project" page makes the portfolio case without requiring the README
- Cross-page data relationships are visible (breadcrumbs, linked cases, nav badges)

## MVP Scope

### 5 Lean Pages + About

Each page: one primary surface, one supporting element, focused interactions.

1. **Operations Overview** — Operational health at a glance. Key metrics, trend chart, program state summary. One composite chart + one support strip.
2. **Case Queue** — Threat intake and triage table. Search, filter, sort. Selected case detail panel with metadata, status controls, notes. The daily driver.
3. **Investigation** — Case deep-dive. Signal timeline, evidence links, AI-generated summary, enforcement readiness. Chart-first layout with supporting context modules.
4. **Domain Portfolio** — Monitored domains table. Security controls indicators, risk flags, registrar action log. Detail panel on selection.
5. **Enforcement Tracker** — Vendor coordination console. Action pipeline table with SLA tracking, status updates, coordination notes. Vendor workload summary.
6. **About This Project** — Dedicated reviewer-facing page. Positioning, workflow explanation, architecture overview, scope decisions, how to evaluate.

### MVP Delight Touches

- **Reset Demo** button — lets reviewer reset seed data after exploring
- **Cross-page breadcrumbs** — e.g., "Queue > Case #BG-0042 > Investigation"
- **Nav rail count badges** — live counts per workflow stage (e.g., Queue shows "7")

## Non-Goals

- No real data ingestion during BUILD phase (seed data only — real pipeline comes in DATA phase)
- No authentication or multi-user support
- No real AI/ML model integration (AI summaries are static mock content)
- No mobile-first design (desktop-first; responsive is POLISH phase)
- No campaign clustering, executive PDF reporting, or model monitoring
- No literal heatmap (tables outperform when data doesn't support 2-axis)
- No dark/light theme toggle (one polished theme)

## Assumptions and Constraints

- Portfolio-grade polish required
- Desktop-first (responsive is post-MVP)
- No backend — all data is mock/seed for BUILD phase
- Lean pages — one hero surface + one support element per page
- Git repo from day 1, GitHub remote from day 1
- Data model designed for interchangeability between seed data and future real pipeline data

## Data / State Model

### Entities

**Case**
- id, title, channel (Domain | Marketplace | Paid Search | App | Social)
- threatType (Impersonation | Phishing | Counterfeit | Scam | Policy Abuse)
- riskScore (0–100), priority (Low | Medium | High | Critical)
- status (New → Triaged → Investigating → Enforcement → Closed)
- owner, summary, aiSummary, aiSuggestedAction
- createdAt, updatedAt, triagedAt, closedAt
- linkedDomainId, notes[]

**Evidence**
- id, caseId
- type (text_snippet | screenshot | url | dns_record | whois_snapshot | cert_log)
- value, capturedAt

**Domain**
- id, domainName, registrar
- status (Active | Monitoring | Incident | Suspended)
- expiresOn
- dnsSecurity { dnssec, registryLock, whoisPrivacy }
- riskFlags[], notes, actionLog[]
- lastFlaggedAt

**Vendor**
- id, name, slaHours (24 | 36 | 48), region, notes

**EnforcementAction**
- id, caseId, vendorId
- actionType (Takedown Notice | Registrar Report | Paid Search Complaint | Marketplace Report | Legal Escalation)
- status (Queued → Sent → In Progress → Resolved | Denied)
- requestedAt, dueAt, resolvedAt, outcome
- notes[]

### Workflow Lifecycle

```
Case:   New → Triaged → Investigating → Enforcement → Closed
Action: Queued → Sent → In Progress → Resolved / Denied
```

### Seed Data

- ~10 cases with varied channels, threat types, priorities, and statuses
- ~4 domains with different risk profiles and security configurations
- ~4 vendors with different SLA windows and regions
- ~6+ enforcement actions at various lifecycle stages
- Evidence records linked to cases

### Persistence

React context + localStorage. State persists across page refreshes. Reset Demo button restores seed data.

## Auth / Access

None for MVP. Single-user demo.

## Post-MVP: DATA Phase

After BUILD, a dedicated DATA phase adds real data ingestion via GitHub Actions cron pipeline pulling from public domain security sources (crt.sh, DNS, WHOIS, typosquatting generation). Same TypeScript interfaces — UI requires zero changes.
