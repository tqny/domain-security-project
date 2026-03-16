import { useAppState } from '@/data/store'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

// === Section components ===

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-text-secondary leading-relaxed space-y-3">{children}</div>
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="text-sm text-text-secondary leading-relaxed space-y-1.5 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-primary mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// === About Page ===

export default function About() {
  const { resetToSeedData } = useAppState()

  function handleReset() {
    if (window.confirm('Reset all data to the original demo state? Any changes you made will be lost.')) {
      resetToSeedData()
    }
  }

  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          About This Project
        </h1>
        <p className="mt-2 text-base text-text-secondary leading-relaxed">
          A portfolio-grade dashboard simulating the end-to-end workflow of a Brand Protection Program Manager — built to demonstrate how domain security operations actually work.
        </p>
      </div>

      {/* Why this exists */}
      <Section title="Why this exists">
        <Prose>
          <p>
            Brand protection is a real operational discipline. Major companies monitor thousands of domains, investigate phishing campaigns, coordinate with enforcement vendors, and track takedown actions — all under SLA pressure.
          </p>
          <p>
            This project simulates that full workflow on behalf of Bank of America. It's not a toy or a tutorial — it's a functional operations console with realistic data, cross-entity relationships, and the kind of information density that actual internal tools require.
          </p>
        </Prose>
      </Section>

      {/* The workflow */}
      <Section title="The workflow">
        <Prose>
          <p>Brand protection follows a clear lifecycle:</p>
        </Prose>
        <div className="rounded-xl border border-border bg-surface p-5 font-mono text-sm text-text-secondary">
          <div className="space-y-1">
            <div><span className="text-primary">Detect</span> — Threats surface via domain monitoring, CT logs, typosquat scans, customer reports</div>
            <div><span className="text-primary">Triage</span> — New cases are assessed, prioritized, and assigned to investigators</div>
            <div><span className="text-primary">Investigate</span> — Evidence is collected, AI analysis is reviewed, risk is scored</div>
            <div><span className="text-primary">Enforce</span> — Takedown notices, registrar reports, and legal actions are coordinated with vendors</div>
            <div><span className="text-primary">Resolve</span> — Actions are tracked through SLA windows to resolution or denial</div>
          </div>
        </div>
        <Prose>
          <p>Each page in this dashboard represents a distinct stage of that lifecycle.</p>
        </Prose>
      </Section>

      {/* What's included */}
      <Section title="What's included in v1">
        <List items={[
          'Operations Overview — Key metrics, case pipeline, and threat distribution at a glance',
          'Case Queue — Threat intake and triage table with search, filter, sort, and detail panels',
          'Investigation — Deep-dive into individual cases with evidence timeline, AI analysis, and decision controls',
          'Domain Portfolio — Monitored domains with security controls, risk flags, and registrar action logs',
          'Enforcement Tracker — Vendor coordination console with SLA tracking, status controls, and workload summary',
          'Interactive demo data — 10 cases, 4 domains, 4 vendors, 7 enforcement actions with full lifecycle states',
          'Cross-page data relationships — Cases link to domains, enforcement actions link to cases and vendors',
        ]} />
      </Section>

      {/* What's intentionally not included */}
      <Section title="What's intentionally out of scope">
        <List items={[
          'No real data ingestion yet — seed data simulates what a real pipeline would produce',
          'No authentication or multi-user support — single-user demo',
          'No real AI/ML integration — AI summaries are realistic static content',
          'No mobile-first design — desktop-first, responsive is a future pass',
        ]} />
        <Prose>
          <p>
            A future DATA phase will add real domain scanning via GitHub Actions — pulling from Certificate Transparency logs, DNS resolution, WHOIS, and typosquatting generation. The data model is designed so the UI requires zero changes when real data replaces seed data.
          </p>
        </Prose>
      </Section>

      {/* Architecture */}
      <Section title="How it's built">
        <List items={[
          'React 19 + TypeScript + Vite — modern, fast, type-safe',
          'React Router v7 — simple client-side routing for 6 pages',
          'React Context + localStorage — lightweight state with persistence across refreshes',
          'Tailwind CSS v4 + shadcn/ui — design token system with semantic color mapping',
          'Zero backend — all state is client-side, ready to swap in real data sources',
          'Fully typed data model — Case, Domain, Vendor, EnforcementAction, Evidence entities',
        ]} />
      </Section>

      {/* What this demonstrates */}
      <Section title="What this demonstrates">
        <Prose>
          <p>This project is part of Tony Mikityuk's portfolio, built to show:</p>
        </Prose>
        <List items={[
          'Deep understanding of brand protection and domain security operations',
          'Ability to translate complex workflows into clear, usable product surfaces',
          'Engineering judgment — clean component architecture, proper TypeScript, modular design',
          'Design sensibility — consistent token system, professional visual language, data-forward layouts',
          'AI-assisted development fluency — built with Claude Code as an orchestration partner',
        ]} />
      </Section>

      {/* How to evaluate */}
      <Section title="How to explore">
        <Prose>
          <p>Start at the Dashboard for the big picture, then:</p>
        </Prose>
        <List items={[
          'Open Case Queue and click any case to see the detail panel — try changing status or adding a note',
          'Switch to Investigation and select a case to see the full evidence timeline and AI analysis',
          'Check Domain Portfolio — click a domain to see security controls, risk flags, and linked cases',
          'Visit Enforcement Tracker — notice the SLA indicators and vendor workload cards',
          'Use the Reset Demo button below to restore original data after experimenting',
        ]} />
      </Section>

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
