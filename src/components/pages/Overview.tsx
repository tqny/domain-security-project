import { useMemo, useState } from 'react'
import { useAppState } from '@/data/store'
import type { CaseStatus, ThreatType, ActionStatus, Channel } from '@/types'
import StatusChip from '@/components/shared/StatusChip'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Pie, PieChart, Cell, Sector } from 'recharts'
import type { TooltipProps } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { palette, chartTheme } from '@/lib/chart-palette'
import { ShieldAlert, Flame, Globe, Clock, ArrowUpRight, ArrowDownRight, Sparkles, MoreHorizontal, Radio } from 'lucide-react'
import { PeriodTabs, type PeriodKey } from '@/components/shared/PeriodTabs'

// === Stats Strip (unified card with dividers) ===

interface StatDef {
  title: string
  value: number
  previousValue: number
  changePercent: number
  isPositive: boolean
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  detail?: string
}

function StatsStrip({ stats }: { stats: StatDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:gap-4 sm:p-5 lg:grid-cols-4 lg:gap-6 lg:p-6">
      {stats.map((stat, index) => (
        <div key={stat.title} className="flex items-start">
          <div className="flex-1 space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex items-center gap-1.5 text-text-secondary sm:gap-2">
              <stat.icon className="size-3.5 sm:size-4" aria-hidden="true" />
              <span className="truncate text-[10px] font-medium sm:text-xs lg:text-sm">
                {stat.title}
              </span>
            </div>
            <p className="hidden text-[10px] text-text-secondary/70 sm:block sm:text-xs">
              {stat.previousValue} previous period
            </p>
            <p className="text-xl leading-tight font-semibold tracking-tight text-foreground sm:text-2xl lg:text-[28px] tabular-nums">
              {stat.value}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[10px] sm:text-xs">
              {stat.isPositive ? (
                <ArrowUpRight className="size-3 shrink-0 text-success sm:size-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3 shrink-0 text-destructive sm:size-3.5" aria-hidden="true" />
              )}
              <span className={stat.isPositive ? 'text-success' : 'text-destructive'}>
                {stat.isPositive ? '+' : ''}{stat.changePercent.toFixed(1)}%
              </span>
              {stat.detail && (
                <span className="whitespace-nowrap text-text-secondary">
                  {stat.detail}
                </span>
              )}
            </div>
          </div>
          {index < stats.length - 1 && (
            <div className="mx-4 hidden h-full w-px bg-border lg:block xl:mx-6" />
          )}
        </div>
      ))}
    </div>
  )
}

// === Case Pipeline Chart (Recharts) ===

const pipelineChartConfig = {
  count: { label: 'Cases', color: palette.primary },
} satisfies ChartConfig

const statusColors: Record<CaseStatus, string> = {
  New: 'var(--primary)',
  Triaged: 'var(--info)',
  Investigating: 'var(--warning)',
  Enforcement: 'var(--destructive)',
  Closed: 'var(--text-secondary)',
}

function PipelineTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.fill }} />
        <span className="text-xs text-text-secondary">Cases:</span>
        <span className="text-xs font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}

function CasePipelineChart({ data }: { data: { name: string; count: number; fill: string }[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">Case pipeline</div>
      <div className="mb-5 text-sm text-text-secondary">Distribution of cases across workflow stages</div>
      <div className="h-[240px] w-full">
        <ChartContainer config={pipelineChartConfig} className="h-full w-full">
          <BarChart layout="vertical" data={data} barSize={20} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} vertical={chartTheme.grid.vertical} stroke={chartTheme.grid.stroke} />
            <XAxis type="number" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} />
            <YAxis type="category" dataKey="name" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} width={90} />
            <Tooltip content={<PipelineTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// === Threat Breakdown Donut (Recharts) ===

const threatChartConfig = {
  Phishing: { label: 'Phishing', color: palette.primary },
  Impersonation: { label: 'Impersonation', color: palette.secondary },
  Scam: { label: 'Scam', color: palette.info },
  Counterfeit: { label: 'Counterfeit', color: palette.success },
  'Policy Abuse': { label: 'Policy Abuse', color: palette.textSecondary },
} satisfies ChartConfig

function ThreatTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, value, fill } = payload[0]?.payload ?? {}
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ backgroundColor: fill }} />
        <span className="text-xs font-medium text-foreground">{name}</span>
      </div>
      <p className="mt-1 text-xs text-text-secondary">{value} case{value !== 1 ? 's' : ''}</p>
    </div>
  )
}

const renderActiveShape = (props: unknown) => {
  const p = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number
    startAngle: number; endAngle: number; fill: string
  }
  return (
    <g>
      <Sector
        cx={p.cx} cy={p.cy}
        innerRadius={p.innerRadius}
        outerRadius={p.outerRadius + 6}
        startAngle={p.startAngle}
        endAngle={p.endAngle}
        fill={p.fill}
      />
    </g>
  )
}

function ThreatBreakdownChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">Threat breakdown</div>
      <div className="mb-5 text-sm text-text-secondary">Cases by threat type</div>
      <div className="flex flex-col items-center">
        <div className="relative size-[200px]">
          <ChartContainer config={threatChartConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="42%"
                outerRadius="72%"
                paddingAngle={3}
                strokeWidth={0}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ThreatTooltip />} />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-xs text-text-secondary">total</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((s, index) => (
            <div
              key={s.name}
              className={`flex items-center gap-2 text-xs text-text-secondary cursor-pointer transition-opacity ${activeIndex !== undefined && activeIndex !== index ? 'opacity-50' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <span className="size-2 rounded-full shrink-0" style={{ background: s.fill }} />
              {s.name} ({s.value})
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// === AI Insights Card ===

import type { AIInsight } from '@/types'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const mockInsights: AIInsight[] = [
  {
    id: 'ai-1',
    severity: 'critical',
    summary: 'Phishing domain bankofamerica-secure.com has been active for 14 days with no enforcement action — recommend immediate takedown request.',
    suggestedAction: 'escalate',
    actionLabel: 'Escalate',
    caseId: 'BG-0042',
  },
  {
    id: 'ai-2',
    severity: 'warning',
    summary: 'Three new typosquat registrations detected targeting bofa.com in the last 48 hours — pattern suggests coordinated campaign.',
    suggestedAction: 'investigate',
    actionLabel: 'Investigate',
    caseId: 'BG-0038',
  },
  {
    id: 'ai-3',
    severity: 'info',
    summary: 'SLA compliance dropped to 71% this week. Two vendors (MarkMonitor, Clarivate) have overdue actions.',
    suggestedAction: 'review',
    actionLabel: 'Review SLAs',
  },
]

const severityStyles = {
  critical: 'bg-destructive',
  warning: 'bg-primary',
  info: 'bg-info',
}

function AIInsightsCard() {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-[0_0_24px_rgba(232,168,56,0.06)]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent-muted">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">AI Triage Insights</h2>
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">Beta</span>
            </div>
            <p className="text-xs text-text-secondary">Automated analysis of today's threat landscape</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mockInsights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-4">
            <div className={`mt-1 size-2 shrink-0 rounded-full ${severityStyles[insight.severity]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-relaxed">{insight.summary}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-7 text-xs"
              onClick={() => {
                if (insight.caseId) {
                  const matchedCase = document.querySelector(`[data-case-id="${insight.caseId}"]`)
                  if (!matchedCase) navigate(`/investigation?case=${insight.caseId}`)
                }
              }}
            >
              {insight.actionLabel}
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-text-secondary">Powered by AI analysis</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary hover:text-primary"
          onClick={() => navigate('/investigation')}
        >
          Deep dive →
        </Button>
      </div>
    </div>
  )
}

// === Threats Detected (YoY Grouped Bar Chart) ===

const threatsTrendConfig = {
  fy26: { label: 'FY26', color: palette.primary },
  fy25: { label: 'FY25', color: palette.secondary },
} satisfies ChartConfig

const monthlyThreatData = [
  { month: 'Oct', fy26: 32, fy25: 22 },
  { month: 'Nov', fy26: 41, fy25: 35 },
  { month: 'Dec', fy26: 36, fy25: 33 },
  { month: 'Jan', fy26: 53, fy25: 30 },
  { month: 'Feb', fy26: 48, fy25: 40 },
  { month: 'Mar', fy26: 65, fy25: 38 },
]

const totalFY26 = monthlyThreatData.reduce((s, d) => s + d.fy26, 0)

function ThreatsTrendTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: String(entry.color) }} />
          <span className="text-xs text-text-secondary">{entry.dataKey === 'fy26' ? 'FY26' : 'FY25'}:</span>
          <span className="text-xs font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function ThreatsTrendChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{totalFY26} cases</span>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">Threats Detected (Last 6 Months)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-xs text-text-secondary">FY26</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full" style={{ backgroundColor: palette.secondary }} />
              <span className="text-xs text-text-secondary">FY25</span>
            </div>
          </div>
          <button className="text-text-secondary hover:text-foreground transition-colors">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ChartContainer config={threatsTrendConfig} className="h-full w-full">
          <BarChart data={monthlyThreatData} barGap={4} barSize={20}>
            <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} vertical={chartTheme.grid.vertical} stroke={chartTheme.grid.stroke} />
            <XAxis dataKey="month" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} dy={8} />
            <YAxis axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} width={30} />
            <Tooltip content={<ThreatsTrendTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Bar dataKey="fy26" fill="var(--color-fy26)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="fy25" fill="var(--color-fy25)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// === Threat Channels Breakdown ===

const channelColors: Record<Channel, string> = {
  Domain: 'var(--primary)',
  Social: palette.secondary,
  'Paid Search': palette.tertiary,
  Marketplace: palette.quaternary,
  App: palette.muted,
}

function ThreatChannelsCard({ channelData }: { channelData: { name: Channel; count: number; color: string }[] }) {
  const total = channelData.reduce((s, d) => s + d.count, 0)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <Radio className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Threat Channels</span>
      </div>

      <div className="mb-5">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{total}</span>
        <span className="text-sm text-text-secondary ml-1.5">active threats</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-6">
        {channelData.map((ch) => (
          <div
            key={ch.name}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${(ch.count / total) * 100}%`,
              backgroundColor: ch.color,
            }}
          />
        ))}
      </div>

      {/* Legend list */}
      <div className="space-y-3">
        {channelData.map((ch) => (
          <div key={ch.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
              <span className="text-sm text-foreground font-medium">{ch.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground tabular-nums">{ch.count}</span>
          </div>
        ))}
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
  const [period, setPeriod] = useState<PeriodKey>('all')

  const statCards = useMemo((): StatDef[] => {
    const openCases = state.cases.filter((c) => c.status !== 'Closed').length
    const criticalHigh = state.cases.filter((c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Closed').length
    const domainsMonitored = state.domains.length
    const pendingActions = state.enforcementActions.filter((a) => a.status !== 'Resolved' && a.status !== 'Denied').length
    const flaggedDomains = state.domains.filter(d => d.riskFlags.length > 0).length

    // Mock previous-period values for demo (will be real in DATA phase)
    return [
      {
        title: 'Open cases',
        value: openCases,
        previousValue: 7,
        changePercent: 28.6,
        isPositive: false,
        icon: ShieldAlert,
        detail: `${criticalHigh} critical/high`,
      },
      {
        title: 'Active threats',
        value: criticalHigh,
        previousValue: 3,
        changePercent: 33.3,
        isPositive: false,
        icon: Flame,
        detail: 'vs last period',
      },
      {
        title: 'Domains monitored',
        value: domainsMonitored,
        previousValue: 3,
        changePercent: 33.3,
        isPositive: true,
        icon: Globe,
        detail: `${flaggedDomains} with risk flags`,
      },
      {
        title: 'Pending actions',
        value: pendingActions,
        previousValue: 4,
        changePercent: 25.0,
        isPositive: false,
        icon: Clock,
        detail: 'awaiting resolution',
      },
    ]
  }, [state])

  // Case status distribution (for Recharts BarChart)
  const pipelineData = useMemo(() => {
    const counts: Record<CaseStatus, number> = { New: 0, Triaged: 0, Investigating: 0, Enforcement: 0, Closed: 0 }
    for (const c of state.cases) counts[c.status]++
    return [
      { name: 'New', count: counts.New, fill: statusColors.New },
      { name: 'Triaged', count: counts.Triaged, fill: statusColors.Triaged },
      { name: 'Investigating', count: counts.Investigating, fill: statusColors.Investigating },
      { name: 'Enforcement', count: counts.Enforcement, fill: statusColors.Enforcement },
      { name: 'Closed', count: counts.Closed, fill: statusColors.Closed },
    ]
  }, [state.cases])

  // Channel distribution (for Threat Channels card)
  const channelData = useMemo(() => {
    const counts: Record<Channel, number> = { Domain: 0, Social: 0, 'Paid Search': 0, Marketplace: 0, App: 0 }
    for (const c of state.cases) counts[c.channel]++
    return (Object.entries(counts) as [Channel, number][])
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count, color: channelColors[name] }))
  }, [state.cases])

  // Threat type distribution (for Recharts PieChart)
  const threatData = useMemo(() => {
    const counts: Record<ThreatType, number> = { Phishing: 0, Impersonation: 0, Counterfeit: 0, Scam: 0, 'Policy Abuse': 0 }
    for (const c of state.cases) counts[c.threatType]++
    const fillMap: Record<ThreatType, string> = {
      Phishing: 'var(--primary)',
      Impersonation: palette.secondary,
      Scam: 'var(--info)',
      Counterfeit: 'var(--success)',
      'Policy Abuse': 'var(--text-secondary)',
    }
    return (Object.entries(counts) as [ThreatType, number][])
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, fill: fillMap[name] }))
  }, [state.cases])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Security <span className="text-primary">overview</span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Program health, threat landscape, and operational metrics across all properties.
          </p>
        </div>
        <PeriodTabs activePeriod={period} onPeriodChange={setPeriod} />
      </div>

      {/* Stat cards */}
      <StatsStrip stats={statCards} />

      {/* AI Insights */}
      <AIInsightsCard />

      {/* Threats trend + channels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ThreatsTrendChart />
        </div>
        <div className="lg:col-span-2">
          <ThreatChannelsCard channelData={channelData} />
        </div>
      </div>

      {/* Pipeline + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CasePipelineChart data={pipelineData} />
        </div>
        <div className="lg:col-span-2">
          <ThreatBreakdownChart data={threatData} />
        </div>
      </div>

      {/* Recent activity */}
      <RecentActivity />
    </div>
  )
}
