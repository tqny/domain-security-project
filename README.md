# Brand Protection Control Center

A portfolio-grade domain threat intelligence dashboard that scans for suspicious domains in real time, enriches them with public threat feeds, and routes findings through a full case management workflow — modeled after how companies like PhishLabs and Allure Security operate at scale.

**[Live Demo](https://tqny.github.io/domain-security-project/)**

## What This Does

Enter a brand domain (e.g., `paypal.com`). The scanner:

1. **Generates** 20+ suspicious variants using 8 techniques (homoglyphs, typosquatting, TLD swaps, keyword injection, etc.)
2. **Probes DNS** via Google DoH to find which variants actually resolve
3. **Enriches** active domains with real threat intelligence — RDAP registration, Certificate Transparency logs (crt.sh), Spamhaus DBL, URLhaus, AlienVault OTX
4. **Scores risk** using compound signal analysis (DNS + fresh cert + recent registration = high confidence threat)
5. **Generates AI analyst summaries** with signal-aware narrative and recommended actions
6. **Pushes results into Sentinel** — a full case management workflow with triage, investigation, enforcement tracking, and executive dashboard

## Why It Exists

Built as a portfolio artifact targeting brand protection and domain security roles. Demonstrates:

- End-to-end understanding of the domain threat detection pipeline (the same pipeline companies charge six figures/year for)
- Ability to translate complex security workflows into clear, usable product surfaces
- Engineering judgment: typed data model, real API integrations, composite scoring, modular React/TypeScript architecture
- AI-assisted development fluency (built with Claude Code)

Part of [Tony Mikityuk's portfolio](https://tqny.github.io/Tony-s-Site/).

## The Workflow

| Stage | What Happens |
|---|---|
| **Live Scan** | Domain variant generation, DNS probing, multi-source enrichment, risk scoring |
| **AI Triage** | Dashboard presents top threats one at a time for agree/review decisions |
| **Investigation** | Case deep-dive with evidence breakdown, signal timeline, risk gauge, scan intel |
| **Case Queue** | Searchable/filterable case management with status controls and owner assignment |
| **Domains** | Monitored domain portfolio with security indicators and registrar action logs |
| **Enforcement** | Vendor coordination with SLA tracking, takedown status, and workload summary |
| **Dashboard** | 9 data visualizations — risk distribution, scan funnel, signal radar, attack vectors, and more |

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 + shadcn/ui (Torch Dark Gold design system)
- Recharts for data visualization
- React Router v7 for navigation
- React Context + sessionStorage for state
- Lucide React for icons, Geist for typography

### Enrichment Sources (real APIs, no mocks)

- Google DNS-over-HTTPS (dns.google)
- RDAP via rdap.org
- Certificate Transparency via crt.sh
- Spamhaus Domain Blocklist (DNS-over-HTTPS)
- URLhaus (abuse.ch)
- AlienVault OTX

## Running Locally

```bash
npm install
npm run dev
```

Or load sample data from the Live Scan page to explore the workflow without running a scan.

## Project Structure

```
src/
├── types/          # TypeScript interfaces (Case, Domain, Vendor, ScanResult, etc.)
├── data/           # Sample data, vendors, state management
├── lib/            # Scan engine, enrichment pipeline, scan-to-case bridge
├── components/
│   ├── shell/      # NavRail, TopBar, Layout, RequireScanData gate
│   ├── shared/     # DataTable, DetailPanel, FilterBar, StatusChip
│   └── pages/      # LiveScan, Overview, Queue, Investigation, Domains, Enforcement, About
└── styles/         # Torch Dark Gold design tokens
```

---

*Built by [Tony Mikityuk](https://tqny.github.io/Tony-s-Site/). See the in-product About page for full project context.*
