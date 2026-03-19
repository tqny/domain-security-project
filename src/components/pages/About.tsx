import { useAppState } from '@/data/store'
import { Button } from '@/components/ui/button'
import { RotateCcw, ShieldCheck, ChevronRight, Radar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// === About Page ===

export default function About() {
  const { resetData, hasData } = useAppState()
  const navigate = useNavigate()

  function handleClearData() {
    if (window.confirm('Clear all scan data? You will need to run a new scan to repopulate the workflow.')) {
      resetData()
    }
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
          <ShieldCheck className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">About This Project</h1>
          <p className="mt-0.5 text-sm text-text-secondary">A portfolio piece by Tony Mikityuk</p>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-3xl">
            This dashboard is a working brand protection tool. Enter any brand domain and Sentinel generates typosquat variants, probes DNS, enriches with RDAP/certificate/threat intelligence data, scores risk, and populates the full enforcement workflow — from AI-powered triage through vendor coordination and resolution.
          </p>
        </div>
      </div>

      {/* Workflow strip */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-foreground mb-5">The Brand Protection Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Scan', color: 'bg-info', description: 'Live Scan generates domain variants using 8 techniques (homoglyphs, keywords, TLD swaps, typos), then enriches via DNS, RDAP, crt.sh, Spamhaus, and URLhaus.' },
            { label: 'Triage', color: 'bg-primary', description: 'Top 5 threats surface in an interactive AI Triage card. Review AI summaries and either agree (auto-escalate) or flag for manual review.' },
            { label: 'Investigation', color: 'bg-[#9333ea]', description: 'Evidence collection: WHOIS snapshots, DNS records, SSL certificates, threat intel reports, and AI-generated analyst summaries.' },
            { label: 'Enforcement', color: 'bg-warning', description: 'Registrar takedowns, platform reports, and legal escalations coordinated across 4 vendor partners with SLA tracking.' },
            { label: 'Resolution', color: 'bg-success', description: 'Threat neutralized, domain suspended or transferred, case closed with full audit trail.' },
          ].map((step, i) => (
            <div
              key={step.label}
              className="flex items-start gap-3 md:flex-col md:items-start rounded-lg p-2 -m-2 transition-all duration-[var(--duration-fast)] hover:bg-surface-hover hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <div className={`size-2.5 rounded-full ${step.color}`} />
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
                {i < 4 && <ChevronRight className="size-3.5 text-text-tertiary hidden md:block" />}
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What This Dashboard Demonstrates */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-primary">◎</span>
          <h2 className="text-base font-semibold text-foreground">What This Dashboard Demonstrates</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {[
            { title: 'Live Domain Scanning', desc: 'Client-side variant generation + multi-source enrichment pipeline (DNS, RDAP, crt.sh, Spamhaus DBL, URLhaus, OTX). Compound risk scoring with signal-aware AI summaries.' },
            { title: 'AI Triage', desc: 'Interactive one-at-a-time review of top threats. Agree auto-creates enforcement actions; Manual Review flags for human investigation. Progress-tracked with slide animations.' },
            { title: 'Case Management', desc: 'Full case lifecycle from scan detection through resolution, with evidence collection, AI analysis, priority-based assignment, and cross-entity navigation.' },
            { title: 'Vendor Enforcement', desc: 'Coordination across 4 enforcement partners with SLA tracking, due date calculations, status controls, and performance metrics.' },
            { title: 'Cross-Entity Linking', desc: 'Cases link to domains, domains link to enforcement actions — every entity is navigable across the workflow.' },
            { title: 'Operational Dashboard', desc: 'Scan summary banner, risk distribution, case pipeline, threat breakdown, and real-time activity feed — all driven by live scan data.' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="rounded-lg p-3 -m-3 transition-all duration-[var(--duration-fast)] hover:bg-surface-hover hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What to Look At + Architecture — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* What to Look At */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">⊞</span>
            <h2 className="text-base font-semibold text-foreground">What to Look At</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Live Scan', desc: 'Start here — scan any brand, watch the enrichment pipeline, push results', path: '/live-scan' },
              { label: 'Operations Overview', desc: 'Scan summary, AI Triage card, risk distribution, case pipeline', path: '/' },
              { label: 'Case Queue', desc: 'Filterable queue with priority + status filters, detail panels', path: '/queue' },
              { label: 'Investigation', desc: 'Deep-dive: evidence timeline, AI analysis, enforcement decisions', path: '/investigation' },
              { label: 'Domain Portfolio', desc: 'DNS security controls, risk flags, registrar action logs', path: '/domains' },
              { label: 'Enforcement Tracker', desc: 'SLA tracking, vendor coordination, action pipeline', path: '/enforcement' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-background p-4 hover:bg-surface-hover transition-colors text-left group"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{item.desc}</div>
                </div>
                <ChevronRight className="size-4 text-text-tertiary group-hover:text-foreground transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary">⟨/⟩</span>
            <h2 className="text-base font-semibold text-foreground">Architecture</h2>
          </div>

          <div className="mb-4">
            <p className="text-xs text-text-secondary mb-2.5">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {['React 19 + TypeScript', 'Vite', 'Tailwind CSS v4', 'shadcn/ui', 'Recharts', 'Geist font family'].map((t) => (
                <span key={t} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-text-secondary">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-2.5">Key Design Decisions</p>
            <div className="space-y-2">
              {[
                'Scan-first workflow: Live Scan → AI Triage → full workflow populated',
                'Multi-source enrichment: DNS, RDAP, crt.sh, Spamhaus, URLhaus, OTX',
                'Compound risk scoring with signal-aware recommendations',
                'React Context + localStorage for persistent state across sessions',
                'Torch Dark Gold design system with amber accent rationing',
              ].map((d) => (
                <div key={d} className="flex gap-2 text-xs text-text-secondary">
                  <span className="text-success mt-0.5 shrink-0">◉</span>
                  <span className="leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scope Decisions */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-primary">◎</span>
          <h2 className="text-base font-semibold text-foreground">Scope Decisions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          {[
            { title: 'Any brand, live data', desc: 'Scan any domain — the enrichment pipeline hits real public APIs. No hardcoded data. Sample data available for quick demos.' },
            { title: 'DNS/domain-heavy focus', desc: 'Domain variant generation, DNS resolution, RDAP registration, certificate transparency, and threat intelligence — the core of brand protection operations.' },
            { title: 'Client-side, no backend', desc: 'All scanning and enrichment runs in the browser via public APIs (dns.google, rdap.org, crt.sh, Spamhaus DNS). No server required.' },
            { title: 'AI-driven triage UX', desc: 'AI scoring, signal-aware analyst summaries, and interactive triage flow demonstrate how AI augments (not replaces) human decision-making.' },
            { title: 'Scan → workflow pipeline', desc: 'One scan populates every page: cases, domains, evidence, enforcement actions. The entire app is driven by real scan output.' },
          ].map((item, i) => (
            <div
              key={item.title}
              className="rounded-lg p-3 -m-3 transition-all duration-[var(--duration-fast)] hover:bg-surface-hover hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${i * 70}ms`, animationFillMode: 'backwards' }}
            >
              <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-accent-muted p-8 text-center">
        <h2 className="text-lg font-semibold text-foreground">Ready to explore?</h2>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          {hasData
            ? 'Your scan data is loaded. Explore the Dashboard, review cases in the Queue, or investigate individual threats.'
            : 'Start with a Live Scan — pick a brand from the suggested targets, or enter any domain. The enrichment pipeline takes about 30 seconds.'
          }
        </p>
        <Button className="mt-5 gap-2" onClick={() => navigate(hasData ? '/' : '/live-scan')}>
          {hasData ? (
            <>
              <Radar className="size-4" />
              Go to Dashboard
            </>
          ) : (
            <>
              <Radar className="size-4" />
              Run Live Scan
            </>
          )}
        </Button>
      </div>

      {/* Clear Data */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Clear data</div>
            <p className="mt-1 text-sm text-text-secondary">
              Clear all scan data and reset the workflow. You'll need to run a new scan.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearData}>
            <RotateCcw className="size-4 mr-1.5" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-6 pb-4 text-xs text-text-tertiary">
        Part of{' '}
        <a
          href="https://tqny.github.io/Tony-s-Site/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Tony Mikityuk's portfolio
        </a>
        . Built with Claude Code.
      </div>
    </div>
  )
}
