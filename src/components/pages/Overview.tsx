import { useMemo } from 'react'
import { useAppState } from '@/data/store'
import type { CaseStatus, ThreatType, ActionStatus } from '@/types'
import StatusChip from '@/components/shared/StatusChip'

// === Stat Card ===

interface StatCardProps {
  label: string
  value: string | number
  trend?: { text: string; direction: 'up' | 'down' | 'neutral' }
  highlighted?: boolean
}

function StatCard({ label, value, trend, highlighted }: StatCardProps) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-6 transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:border-border-emphasis hover:-translate-y-0.5 hover:shadow-medium ${highlighted ? 'border-l-[3px] border-l-primary' : ''}`}>
      <div className="text-sm font-medium text-text-secondary mb-2">{label}</div>
      <div className="text-3xl font-bold tracking-tight text-foreground tabular-nums leading-tight mb-3">{value}</div>
      {trend && (
        <span className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ${
          trend.direction === 'up' ? 'text-success bg-success-muted' :
          trend.direction === 'down' ? 'text-destructive bg-danger-muted' :
          'text-text-secondary bg-surface-alt'
        }`}>
          {trend.direction === 'up' && <TrendUp />}
          {trend.direction === 'down' && <TrendDown />}
          {trend.direction === 'neutral' && <TrendFlat />}
          {trend.text}
        </span>
      )}
    </div>
  )
}

function TrendUp() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
}
function TrendDown() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>
}
function TrendFlat() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3"><line x1="1" y1="12" x2="23" y2="12" /></svg>
}

// === Bar Chart (CSS-based) ===

interface BarItem {
  label: string
  value: number
  color: string
}

function HorizontalBarChart({ items, title, subtitle }: { items: BarItem[]; title: string; subtitle: string }) {
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">{title}</div>
      <div className="mb-6 text-sm text-text-secondary">{subtitle}</div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-text-secondary">{item.label}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-surface-alt overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-[var(--duration-slow)] ease-[var(--ease-spring)]"
                style={{ width: `${(item.value / max) * 100}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Donut Chart (CSS conic-gradient) ===

interface DonutSegment {
  label: string
  value: number
  color: string
}

function DonutChart({ segments, title, subtitle }: { segments: DonutSegment[]; title: string; subtitle: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  // Build conic gradient
  let accumulated = 0
  const gradientStops = segments.flatMap((s) => {
    const start = (accumulated / total) * 360
    accumulated += s.value
    const end = (accumulated / total) * 360
    return [`${s.color} ${start}deg ${end}deg`]
  })

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">{title}</div>
      <div className="mb-6 text-sm text-text-secondary">{subtitle}</div>
      <div className="flex flex-col items-center">
        {/* Donut */}
        <div
          className="relative size-44 rounded-full"
          style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
        >
          <div className="absolute inset-10 rounded-full bg-surface flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-xs text-text-secondary">total</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-5">
          {segments.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="size-2 rounded-full shrink-0" style={{ background: s.color }} />
              {s.label} ({s.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// === Recent Activity ===

function RecentActivity() {
  const { state } = useAppState()

  // Collect recent events from cases and enforcement actions
  const events = useMemo(() => {
    const items: { id: string; date: string; label: string; detail: string; status: CaseStatus | ActionStatus }[] = []

    for (const c of state.cases) {
      items.push({
        id: c.id,
        date: c.updatedAt,
        label: c.id,
        detail: c.title,
        status: c.status,
      })
    }

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6)
  }, [state.cases])

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">Recent Case Activity</div>
      <div className="mb-5 text-sm text-text-secondary">Latest updates across the case queue</div>
      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{ev.label}</span>
                <StatusChip value={ev.status as CaseStatus} type="status" />
              </div>
              <p className="text-sm text-text-secondary truncate mt-0.5">{ev.detail}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Overview Page ===

export default function Overview() {
  const { state } = useAppState()

  const stats = useMemo(() => {
    const openCases = state.cases.filter((c) => c.status !== 'Closed').length
    const criticalHigh = state.cases.filter((c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Closed').length
    const domainsMonitored = state.domains.length
    const pendingActions = state.enforcementActions.filter((a) => a.status !== 'Resolved' && a.status !== 'Denied').length
    const slaBreaches = state.enforcementActions.filter((a) => {
      if (a.status === 'Resolved' || a.status === 'Denied') return false
      return Date.now() > new Date(a.dueAt).getTime()
    }).length

    return { openCases, criticalHigh, domainsMonitored, pendingActions, slaBreaches }
  }, [state])

  // Case status distribution
  const statusBars = useMemo(() => {
    const counts: Record<CaseStatus, number> = { New: 0, Triaged: 0, Investigating: 0, Enforcement: 0, Closed: 0 }
    for (const c of state.cases) counts[c.status]++
    return [
      { label: 'New', value: counts.New, color: 'var(--accent-primary)' },
      { label: 'Triaged', value: counts.Triaged, color: 'var(--info)' },
      { label: 'Investigating', value: counts.Investigating, color: 'var(--warning)' },
      { label: 'Enforcement', value: counts.Enforcement, color: 'var(--destructive)' },
      { label: 'Closed', value: counts.Closed, color: 'var(--text-secondary)' },
    ]
  }, [state.cases])

  // Threat type distribution
  const threatSegments = useMemo(() => {
    const counts: Record<ThreatType, number> = { Phishing: 0, Impersonation: 0, Counterfeit: 0, Scam: 0, 'Policy Abuse': 0 }
    for (const c of state.cases) counts[c.threatType]++
    return [
      { label: 'Phishing', value: counts.Phishing, color: 'var(--accent-primary)' },
      { label: 'Impersonation', value: counts.Impersonation, color: 'var(--chart-2)' },
      { label: 'Scam', value: counts.Scam, color: 'var(--chart-3)' },
      { label: 'Counterfeit', value: counts.Counterfeit, color: 'var(--chart-4)' },
      { label: 'Policy Abuse', value: counts['Policy Abuse'], color: 'var(--chart-5)' },
    ].filter((s) => s.value > 0)
  }, [state.cases])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Security <span className="text-primary">overview</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Program health, threat landscape, and operational metrics across all properties.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Open cases"
          value={stats.openCases}
          trend={{ text: `${stats.criticalHigh} critical/high`, direction: stats.criticalHigh > 3 ? 'down' : 'up' }}
          highlighted
        />
        <StatCard
          label="Active threats"
          value={stats.criticalHigh}
          trend={{ text: `${state.cases.filter(c => c.status === 'Investigating').length} investigating`, direction: 'neutral' }}
        />
        <StatCard
          label="Domains monitored"
          value={stats.domainsMonitored}
          trend={{ text: `${state.domains.filter(d => d.riskFlags.length > 0).length} with risk flags`, direction: 'neutral' }}
        />
        <StatCard
          label="Pending actions"
          value={stats.pendingActions}
          trend={stats.slaBreaches > 0
            ? { text: `${stats.slaBreaches} SLA breach${stats.slaBreaches > 1 ? 'es' : ''}`, direction: 'down' }
            : { text: 'All within SLA', direction: 'up' }
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <HorizontalBarChart
            items={statusBars}
            title="Case pipeline"
            subtitle="Distribution of cases across workflow stages"
          />
        </div>
        <div className="lg:col-span-2">
          <DonutChart
            segments={threatSegments}
            title="Threat breakdown"
            subtitle="Cases by threat type"
          />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity />
    </div>
  )
}
