import { useAppState } from '@/data/store'
import { Button } from '@/components/ui/button'
import { RotateCcw, ShieldCheck, ChevronRight, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// === About Page ===

export default function About() {
  const { resetToSeedData } = useAppState()
  const navigate = useNavigate()

  function handleReset() {
    if (window.confirm('Reset all data to the original demo state? Any changes you made will be lost.')) {
      resetToSeedData()
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
            This dashboard simulates the daily operating environment for a Brand Protection Program Manager at a major financial institution. It demonstrates end-to-end workflow — from AI-powered threat detection and DNS analysis, through UDRP filings and vendor enforcement coordination, to executive-level reporting — all at the scale Bank of America operates.
          </p>
        </div>
      </div>

      {/* Workflow strip */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-base font-semibold text-foreground mb-5">The Brand Protection Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Detection', color: 'bg-info', description: 'ML models scan domains daily, flagging threats with predictive classification.' },
            { label: 'Triage', color: 'bg-primary', description: 'Threats are scored, prioritized, and assigned. AI confidence determines auto-triage eligibility.' },
            { label: 'Investigation', color: 'bg-[#9333ea]', description: 'Evidence collection: WHOIS, DNS records, SSL certs, screenshots, and AI classification.' },
            { label: 'Enforcement', color: 'bg-warning', description: 'Registrar takedowns, platform reports, and paid search complaints via vendor partners.' },
            { label: 'Resolution', color: 'bg-success', description: 'Threat neutralized, domain secured or transferred, executive report generated.' },
          ].map((step, i) => (
            <div key={step.label} className="flex items-start gap-3 md:flex-col md:items-start">
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
            { title: 'Domains & DNS', desc: 'Portfolio management of monitored domains, registrar operations, DNSSEC, registry locks, and AI-powered DNS threat detection.' },
            { title: 'Case Management', desc: 'Full case lifecycle from detection through resolution, with evidence collection, AI analysis, and priority-based triage.' },
            { title: 'Vendor Enforcement', desc: 'Coordination across 4 enforcement partners with SLA tracking, status controls, and performance metrics.' },
            { title: 'AI Integration', desc: 'Predictive scoring, auto-classification, and AI-generated summaries reflect emerging AI-driven brand protection.' },
            { title: 'Cross-Entity Linking', desc: 'Cases link to domains, domains link to enforcement actions — every entity is navigable across the workflow.' },
            { title: 'Executive Reporting', desc: 'KPI dashboards, trend analysis, and channel breakdown — the kind of reporting leadership actually reviews.' },
          ].map((item) => (
            <div key={item.title}>
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
              { label: 'Operations Overview', desc: 'Executive briefing, KPIs, AI insights, pipeline', path: '/' },
              { label: 'Case Queue', desc: 'Filterable queue with channel + priority filters', path: '/queue' },
              { label: 'Investigation', desc: 'Deep-dive: evidence timeline, AI analysis output', path: '/investigation' },
              { label: 'Domain Portfolio', desc: 'DNS security controls, AI risk scores, registrar ops', path: '/domains' },
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
              {['React 19 + TypeScript', 'Vite', 'Tailwind CSS v4', 'shadcn/ui + shadcnblocks', 'Recharts', 'Geist font family'].map((t) => (
                <span key={t} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-text-secondary">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-text-secondary mb-2.5">Key Design Decisions</p>
            <div className="space-y-2">
              {[
                'Centralized TypeScript data model with strict types for BofA threat taxonomy',
                'React Context for cross-page state (selected case, vendor data, reset)',
                'AI prediction model integrated at case and domain level',
                'Torch Dark Gold theme with warm-tinted dark mode',
                'Seed data shaped for real API interchangeability — zero structural changes needed',
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
            { title: 'BofA branding, realistic data', desc: 'Demonstrates domain knowledge specific to how a Program Manager at a major bank would operate at global scale.' },
            { title: 'DNS/domain-heavy focus', desc: "Matches the JD's primary responsibility: domain management, registrar operations, and DNS-based threat solutions." },
            { title: 'Seed data, no backend', desc: 'Data model is shaped for real API interchangeability. Swapping seed data for live endpoints requires zero structural changes.' },
            { title: 'AI-prominent UX', desc: "AI scoring, auto-classification, and model performance metrics reflect the emphasis on AI-driven brand protection." },
            { title: 'Executive briefing strip', desc: "The dashboard calls out 'executive-level communications and reports' — the Overview page demonstrates this thinking." },
          ].map((item) => (
            <div key={item.title}>
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
          Start with the Operations Overview, click into a case from the Queue, then follow it through Investigation and Enforcement.
        </p>
        <Button className="mt-5 gap-2" onClick={() => navigate('/')}>
          <LayoutDashboard className="size-4" />
          Go to Overview
        </Button>
      </div>

      {/* Reset Demo */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Reset demo data</div>
            <p className="mt-1 text-sm text-text-secondary">
              Restore all cases, domains, and enforcement actions to their original state.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4 mr-1.5" />
            Reset Demo
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
