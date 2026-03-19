import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { CaseStatus, ThreatType, ActionStatus } from '@/types'
import type { Case } from '@/types'
import StatusChip from '@/components/shared/StatusChip'
import { Button } from '@/components/ui/button'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Pie, PieChart, Cell, Sector, Legend } from 'recharts'
import type { TooltipProps } from 'recharts'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import { palette, chartTheme } from '@/lib/chart-palette'
import type { EvidenceType } from '@/types'
import {
  ShieldAlert,
  Flame,
  Globe,
  Clock,
  Sparkles,
  CheckCircle2,
  Flag,
  Radar,
  Users,
  FileSearch,
} from 'lucide-react'

// === Count-up hook ===

function useCountUp(target: number, duration = 600): number {
  const [value, setValue] = useState(0)
  const prevTarget = useRef(target)

  useEffect(() => {
    const start = prevTarget.current !== target ? 0 : value
    prevTarget.current = target
    if (target === 0) { setValue(0); return }

    const startTime = performance.now()
    let raf: number

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return value
}

// === Simplified Stats Strip ===

interface StatDef {
  title: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  detail?: string
}

function AnimatedStat({ stat, index, total }: { stat: StatDef; index: number; total: number }) {
  const displayValue = useCountUp(stat.value, 500 + index * 100)

  return (
    <div className="group flex items-start cursor-default">
      <div className="relative flex-1 space-y-1 rounded-lg px-2 py-1.5 -mx-2 -my-1.5 transition-all duration-200 ease-[var(--ease-standard)] group-hover:bg-surface-hover sm:space-y-2 lg:space-y-3">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 rounded-full bg-primary transition-all duration-200 group-hover:h-8" />
        <div className="flex items-center gap-1.5 text-text-secondary sm:gap-2 transition-colors duration-200 group-hover:text-primary">
          <stat.icon className="size-3.5 sm:size-4" aria-hidden="true" />
          <span className="truncate text-[10px] font-medium sm:text-xs lg:text-sm">
            {stat.title}
          </span>
        </div>
        <p className="text-xl leading-tight font-semibold tracking-tight text-foreground sm:text-2xl lg:text-[28px] tabular-nums transition-transform duration-200 group-hover:scale-105 origin-left">
          {displayValue}
        </p>
        {stat.detail && (
          <span className="text-[10px] text-text-secondary sm:text-xs transition-colors duration-200 group-hover:text-text-secondary/80">
            {stat.detail}
          </span>
        )}
      </div>
      {index < total - 1 && (
        <div className="mx-4 hidden h-full w-px bg-border lg:block xl:mx-6" />
      )}
    </div>
  )
}

function StatsStrip({ stats }: { stats: StatDef[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface p-4 sm:gap-4 sm:p-5 lg:grid-cols-4 lg:gap-6 lg:p-6">
      {stats.map((stat, index) => (
        <AnimatedStat key={stat.title} stat={stat} index={index} total={stats.length} />
      ))}
    </div>
  )
}

// === Scan Summary Banner ===

function ScanBanner() {
  const { state } = useAppState()
  const meta = state.scanMeta
  if (!meta) return null

  const scannedDate = new Date(meta.scannedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-surface px-5 py-3">
      <div className="flex items-center gap-2">
        <Radar className="size-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{meta.brandDomain}</span>
      </div>
      <span className="text-xs text-text-tertiary">Scanned {scannedDate}</span>
      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span><span className="font-semibold text-foreground tabular-nums">{meta.totalProbed}</span> probed</span>
        <span className="text-text-tertiary">→</span>
        <span><span className="font-semibold text-foreground tabular-nums">{meta.totalResolved}</span> resolved</span>
        <span className="text-text-tertiary">→</span>
        <span><span className="font-semibold text-primary tabular-nums">{meta.totalActionable}</span> actionable</span>
      </div>
    </div>
  )
}

// === AI Triage Card (one-at-a-time with slide animation) ===

function TriageCard() {
  const { state, triageCaseAgree, triageCaseManualReview } = useAppState()
  const navigate = useNavigate()

  const triageCases = useMemo(() =>
    state.cases.filter((c) => c.triageStatus === 'pending' || c.triageStatus === 'agreed' || c.triageStatus === 'manual-review'),
    [state.cases]
  )

  const pendingCases = useMemo(() => triageCases.filter((c) => c.triageStatus === 'pending'), [triageCases])
  const resolvedCases = useMemo(() => triageCases.filter((c) => c.triageStatus !== 'pending'), [triageCases])
  const allResolved = triageCases.length > 0 && pendingCases.length === 0
  const agreedCount = resolvedCases.filter((c) => c.triageStatus === 'agreed').length
  const reviewCount = resolvedCases.filter((c) => c.triageStatus === 'manual-review').length

  // Animation state for slide transitions
  const [slideState, setSlideState] = useState<'visible' | 'sliding-out' | 'sliding-in'>('visible')
  const currentCase = pendingCases[0] ?? null

  const handleAction = useCallback((action: 'agree' | 'manual-review') => {
    if (!currentCase) return
    // Start slide-out animation
    setSlideState('sliding-out')
    setTimeout(() => {
      // Execute the action (state updates)
      if (action === 'agree') triageCaseAgree(currentCase.id)
      else triageCaseManualReview(currentCase.id)
      // Start slide-in animation for next card
      setSlideState('sliding-in')
      setTimeout(() => setSlideState('visible'), 50)
    }, 350)
  }, [currentCase, triageCaseAgree, triageCaseManualReview])

  if (triageCases.length === 0) return null

  const progressIndex = resolvedCases.length + 1
  const totalCount = triageCases.length

  return (
    <div className="rounded-xl border border-primary/20 bg-surface p-6 shadow-[0_0_24px_rgba(232,168,56,0.06)] animate-[fadeSlideIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent-muted transition-transform duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(232,168,56,0.2)]">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">AI Triage</h2>
              {!allResolved && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                  {progressIndex} of {totalCount}
                </span>
              )}
              {allResolved && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Complete
                </span>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              {allResolved
                ? `${agreedCount} escalated, ${reviewCount} flagged for review`
                : 'Review the highest-risk threats from your scan'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!allResolved && (
        <div className="flex gap-1.5 mb-5">
          {triageCases.map((c, i) => {
            const isActive = i === resolvedCases.length && c.triageStatus === 'pending'
            return (
              <div
                key={c.id}
                className={`flex-1 rounded-full transition-all duration-[var(--duration-base)] ease-[var(--ease-standard)] ${
                  c.triageStatus === 'agreed' ? 'h-1 bg-success' :
                  c.triageStatus === 'manual-review' ? 'h-1 bg-warning' :
                  isActive ? 'h-1.5 bg-primary animate-pulse' :
                  'h-1 bg-surface-alt'
                }`}
              />
            )
          })}
        </div>
      )}

      {/* Active card (one at a time) */}
      {currentCase && (
        <div
          className={`overflow-hidden transition-all ease-[var(--ease-standard)] ${
            slideState === 'sliding-out'
              ? 'opacity-0 -translate-x-4 max-h-0 duration-300'
              : slideState === 'sliding-in'
              ? 'opacity-0 translate-x-4 max-h-[500px] duration-0'
              : 'opacity-100 translate-x-0 max-h-[500px] duration-300'
          }`}
        >
          <ActiveTriageCard
            caseData={currentCase}
            onAgree={() => handleAction('agree')}
            onManualReview={() => handleAction('manual-review')}
            onNavigate={() => navigate(`/investigation?case=${currentCase.id}`)}
          />
        </div>
      )}

      {/* Resolved list (compact) */}
      {resolvedCases.length > 0 && (
        <div className={`space-y-0 ${currentCase ? 'mt-4 pt-4 border-t border-border' : ''}`}>
          {resolvedCases.map((c) => (
            <ResolvedTriageRow key={c.id} caseData={c} />
          ))}
        </div>
      )}

      {/* Completed footer */}
      {allResolved && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-text-secondary">All high-priority threats triaged</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-primary hover:text-primary"
            onClick={() => navigate('/queue')}
          >
            View case queue →
          </Button>
        </div>
      )}
    </div>
  )
}

/** Full-size card for the currently active triage item */
function ActiveTriageCard({
  caseData,
  onAgree,
  onManualReview,
  onNavigate,
}: {
  caseData: Case
  onAgree: () => void
  onManualReview: () => void
  onNavigate: () => void
}) {
  const domainName = caseData.linkedDomainId
    ? (caseData.title.split(': ')[1] || caseData.title)
    : caseData.title

  return (
    <div className="rounded-lg border border-primary/30 bg-background p-5 shadow-[0_0_20px_rgba(232,168,56,0.04)] hover:shadow-[0_0_30px_rgba(232,168,56,0.08)] transition-shadow duration-300">
      {/* Domain header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-base font-medium text-foreground">{domainName}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-transform duration-200 hover:scale-110 ${
          caseData.riskScore >= 70 ? 'bg-danger-muted text-destructive' :
          caseData.riskScore >= 50 ? 'bg-warning-muted text-warning' :
          'bg-info-muted text-info'
        }`}>
          {caseData.riskScore}
        </span>
        <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs font-medium text-text-secondary">{caseData.threatType}</span>
      </div>

      {/* AI Summary */}
      <div className="mb-4">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">AI Summary</div>
        <p className="text-sm text-text-secondary leading-relaxed">{caseData.aiSummary}</p>
      </div>

      {/* Suggested Action */}
      <div className="rounded-lg border border-primary/20 bg-accent-muted/30 p-3 mb-4 hover:border-primary/40 hover:bg-accent-muted/50 transition-all duration-200">
        <div className="text-[10px] font-medium uppercase tracking-wider text-primary/70 mb-1">Suggested Action</div>
        <p className="text-sm text-foreground">{caseData.aiSuggestedAction}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 px-4 text-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(232,168,56,0.3)]" onClick={onAgree}>
          <CheckCircle2 className="size-3.5 mr-1.5" />
          Agree
        </Button>
        <Button variant="outline" size="sm" className="h-8 px-4 text-xs transition-all duration-200 hover:scale-[1.03]" onClick={onManualReview}>
          <Flag className="size-3.5 mr-1.5" />
          Manual Review
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-text-secondary ml-auto transition-colors duration-200 hover:text-primary" onClick={onNavigate}>
          View details →
        </Button>
      </div>
    </div>
  )
}

/** Compact single-line row for a resolved triage item */
function ResolvedTriageRow({ caseData }: { caseData: Case }) {
  const domainName = caseData.linkedDomainId
    ? (caseData.title.split(': ')[1] || caseData.title)
    : caseData.title

  const entryRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      ref={entryRef}
      className={`group flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md cursor-default transition-all duration-300 ease-[var(--ease-out)] hover:bg-surface-hover ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {caseData.triageStatus === 'agreed' ? (
        <CheckCircle2 className="size-4 shrink-0 text-success transition-transform duration-200 group-hover:scale-125" />
      ) : (
        <Flag className="size-4 shrink-0 text-warning transition-transform duration-200 group-hover:scale-125" />
      )}
      <span className="font-mono text-xs text-text-secondary truncate transition-colors duration-200 group-hover:text-foreground">{domainName}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
        caseData.riskScore >= 70 ? 'bg-danger-muted text-destructive' :
        caseData.riskScore >= 50 ? 'bg-warning-muted text-warning' :
        'bg-info-muted text-info'
      }`}>
        {caseData.riskScore}
      </span>
      <span className="ml-auto text-[11px] text-text-secondary whitespace-nowrap transition-colors duration-200 group-hover:text-text-secondary/80">
        {caseData.triageStatus === 'agreed'
          ? 'Escalated — enforcement action created'
          : 'Flagged for manual review'
        }
      </span>
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
    <div className="rounded-lg border border-border p-2.5 shadow-lg" style={{ backgroundColor: '#161616', zIndex: 20 }}>
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
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              activeBar={{ fillOpacity: 1, stroke: 'var(--foreground)', strokeWidth: 1, strokeOpacity: 0.3 }}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} fillOpacity={0.8} />
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
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-xs text-text-secondary">total</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((s, index) => {
            const isActive = activeIndex === index
            const isDimmed = activeIndex !== undefined && !isActive
            return (
              <div
                key={s.name}
                className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ease-[var(--ease-standard)] ${isDimmed ? 'opacity-35 scale-100' : isActive ? 'opacity-100 scale-110' : 'opacity-100 scale-100'}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <span
                  className={`rounded-full shrink-0 transition-all duration-200 ${isActive ? 'size-3 shadow-[0_0_8px_currentColor]' : 'size-2'}`}
                  style={{ background: s.fill, color: s.fill }}
                />
                <span className={`transition-all duration-200 ${isActive ? 'text-foreground text-sm font-semibold' : 'text-text-secondary text-xs'}`}>
                  {s.name}
                </span>
                <span className={`transition-all duration-200 tabular-nums ${isActive ? 'text-foreground text-sm font-bold' : 'text-text-secondary text-xs'}`}>
                  {s.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// === Risk Distribution Card (replaces Threat Channels) ===

function RiskDistributionCard() {
  const { state } = useAppState()
  const [mounted, setMounted] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const riskData = useMemo(() => {
    const high = state.cases.filter((c) => c.priority === 'Critical' || c.priority === 'High').length
    const medium = state.cases.filter((c) => c.priority === 'Medium').length
    const low = state.cases.filter((c) => c.priority === 'Low').length
    return [
      { label: 'Critical / High', count: high, color: 'var(--destructive)' },
      { label: 'Medium', count: medium, color: 'var(--warning)' },
      { label: 'Low', count: low, color: 'var(--success)' },
    ]
  }, [state.cases])

  const total = riskData.reduce((s, d) => s + d.count, 0)
  if (total === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <ShieldAlert className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Risk Distribution</span>
      </div>

      <div className="mb-5">
        <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">{total}</span>
        <span className="text-sm text-text-secondary ml-1.5">cases</span>
      </div>

      {/* Stacked bar */}
      <div className={`flex rounded-full overflow-hidden mb-6 transition-all duration-200 ${hoveredIdx !== undefined ? 'h-5' : 'h-3'}`}>
        {riskData.map((d, i) => {
          const isActive = hoveredIdx === i
          const isDimmed = hoveredIdx !== undefined && !isActive
          return (
            <div
              key={d.label}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-200 cursor-default"
              style={{
                width: mounted ? `${(d.count / total) * 100}%` : '0%',
                backgroundColor: d.color,
                opacity: isDimmed ? 0.4 : 1,
                filter: isActive ? 'brightness(1.3)' : 'none',
                transitionDuration: mounted ? '200ms' : '700ms',
                transitionDelay: mounted ? '0ms' : `${i * 100}ms`,
              }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(undefined)}
            />
          )
        })}
      </div>

      {/* Legend list */}
      <div className="space-y-3">
        {riskData.map((d, i) => {
          const isActive = hoveredIdx === i
          const isDimmed = hoveredIdx !== undefined && !isActive
          return (
            <div
              key={d.label}
              className={`flex items-center justify-between cursor-default transition-all duration-200 ${isDimmed ? 'opacity-40' : isActive ? 'scale-[1.02] origin-left' : ''}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(undefined)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`rounded-full shrink-0 transition-all duration-200 ${isActive ? 'size-3.5 shadow-[0_0_8px_currentColor]' : 'size-2.5'}`}
                  style={{ backgroundColor: d.color, color: d.color }}
                />
                <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-foreground' : 'text-text-secondary'}`}>{d.label}</span>
              </div>
              <span className={`font-semibold tabular-nums transition-all duration-200 ${isActive ? 'text-foreground text-base' : 'text-sm text-foreground'}`}>{d.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// === Vendor Enforcement Pipeline (grouped bar) ===

const vendorChartConfig = {
  Queued: { label: 'Queued', color: 'var(--text-secondary)' },
  Sent: { label: 'Sent', color: 'var(--info)' },
  'In Progress': { label: 'In Progress', color: 'var(--warning)' },
} satisfies ChartConfig

function VendorTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border p-2.5 shadow-lg" style={{ backgroundColor: '#161616', zIndex: 20 }}>
      <p className="mb-1.5 text-xs font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: String(entry.color) }} />
          <span className="text-xs text-text-secondary">{String(entry.dataKey)}:</span>
          <span className="text-xs font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

function VendorPipelineChart() {
  const { state } = useAppState()

  const data = useMemo(() => {
    const vendorMap = new Map<string, { name: string; Queued: number; Sent: number; 'In Progress': number }>()
    for (const v of state.vendors) {
      vendorMap.set(v.id, { name: v.name.split(' ')[0], Queued: 0, Sent: 0, 'In Progress': 0 })
    }
    for (const a of state.enforcementActions) {
      const vendor = vendorMap.get(a.vendorId)
      if (vendor && (a.status === 'Queued' || a.status === 'Sent' || a.status === 'In Progress')) {
        vendor[a.status]++
      }
    }
    return [...vendorMap.values()].filter((v) => v.Queued + v.Sent + v['In Progress'] > 0)
  }, [state.vendors, state.enforcementActions])

  if (data.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Users className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Enforcement Partners</span>
      </div>
      <div className="mb-5 text-sm text-text-secondary">Active actions by vendor and status</div>
      <div className="h-[200px] w-full">
        <ChartContainer config={vendorChartConfig} className="h-full w-full">
          <BarChart data={data} barGap={2} barSize={14} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} vertical={chartTheme.grid.vertical} stroke={chartTheme.grid.stroke} />
            <XAxis dataKey="name" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} dy={8} />
            <YAxis axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} width={24} allowDecimals={false} />
            <Tooltip content={<VendorTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Legend
              verticalAlign="top"
              align="right"
              height={28}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => <span className="text-[11px] text-text-secondary">{value}</span>}
            />
            <Bar dataKey="Queued" fill="var(--color-Queued)" radius={[2, 2, 0, 0]} animationDuration={700} animationBegin={0} animationEasing="ease-out" fillOpacity={0.8} activeBar={{ fillOpacity: 1, stroke: 'var(--foreground)', strokeWidth: 1, strokeOpacity: 0.3 }} />
            <Bar dataKey="Sent" fill="var(--color-Sent)" radius={[2, 2, 0, 0]} animationDuration={700} animationBegin={150} animationEasing="ease-out" fillOpacity={0.8} activeBar={{ fillOpacity: 1, stroke: 'var(--foreground)', strokeWidth: 1, strokeOpacity: 0.3 }} />
            <Bar dataKey="In Progress" fill="var(--color-In Progress)" radius={[2, 2, 0, 0]} animationDuration={700} animationBegin={300} animationEasing="ease-out" fillOpacity={0.8} activeBar={{ fillOpacity: 1, stroke: 'var(--foreground)', strokeWidth: 1, strokeOpacity: 0.3 }} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// === Evidence Sources Breakdown (horizontal bar) ===

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  dns_record: 'DNS Records',
  whois_snapshot: 'WHOIS / RDAP',
  cert_log: 'Certificate Logs',
  threat_intel: 'Threat Intelligence',
  text_snippet: 'Text Analysis',
  screenshot: 'Screenshots',
  url: 'URLs',
}

const EVIDENCE_COLORS: Record<EvidenceType, string> = {
  dns_record: 'var(--info)',
  whois_snapshot: palette.secondary,
  cert_log: 'var(--warning)',
  threat_intel: 'var(--destructive)',
  text_snippet: 'var(--text-secondary)',
  screenshot: palette.tertiary,
  url: palette.quaternary,
}

const evidenceChartConfig = {
  count: { label: 'Evidence', color: palette.primary },
} satisfies ChartConfig

function EvidenceTooltipContent({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border p-2.5 shadow-lg" style={{ backgroundColor: '#161616', zIndex: 20 }}>
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ backgroundColor: payload[0]?.payload?.fill }} />
        <span className="text-xs text-text-secondary">Items:</span>
        <span className="text-xs font-medium text-foreground">{payload[0]?.value}</span>
      </div>
    </div>
  )
}

function EvidenceSourcesChart() {
  const { state } = useAppState()

  const data = useMemo(() => {
    const counts: Partial<Record<EvidenceType, number>> = {}
    for (const e of state.evidence) {
      counts[e.type] = (counts[e.type] ?? 0) + 1
    }
    return (Object.entries(counts) as [EvidenceType, number][])
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        name: EVIDENCE_LABELS[type] ?? type,
        count,
        fill: EVIDENCE_COLORS[type] ?? palette.muted,
      }))
  }, [state.evidence])

  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <FileSearch className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Evidence Collected</span>
      </div>
      <div className="mb-5 text-sm text-text-secondary">{total} items across {data.length} intelligence sources</div>
      <div className="h-[200px] w-full">
        <ChartContainer config={evidenceChartConfig} className="h-full w-full">
          <BarChart layout="vertical" data={data} barSize={16} margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} vertical={chartTheme.grid.vertical} stroke={chartTheme.grid.stroke} />
            <XAxis type="number" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} allowDecimals={false} />
            <YAxis type="category" dataKey="name" axisLine={chartTheme.axisLine} tickLine={chartTheme.tickLine} tick={chartTheme.tick} width={120} />
            <Tooltip content={<EvidenceTooltipContent />} cursor={{ fillOpacity: 0.05 }} />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              animationDuration={800}
              animationEasing="ease-out"
              activeBar={{ fillOpacity: 1, stroke: 'var(--foreground)', strokeWidth: 1, strokeOpacity: 0.3 }}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// === Attack Vector Breakdown (generation methods donut) ===

import type { GenerationMethod } from '@/types/scan'

const METHOD_LABELS: Record<GenerationMethod, string> = {
  'homoglyph': 'Homoglyph',
  'keyword': 'Keyword',
  'tld-variation': 'TLD Swap',
  'char-substitution': 'Char Swap',
  'char-transposition': 'Transposition',
  'char-insertion': 'Insertion',
  'char-deletion': 'Deletion',
  'hyphenation': 'Hyphenation',
}

const METHOD_COLORS: Record<GenerationMethod, string> = {
  'homoglyph': 'var(--destructive)',
  'keyword': 'var(--primary)',
  'tld-variation': 'var(--info)',
  'char-substitution': palette.secondary,
  'char-transposition': palette.tertiary,
  'char-insertion': 'var(--success)',
  'char-deletion': palette.quaternary,
  'hyphenation': 'var(--text-secondary)',
}

const attackVectorConfig = {
  count: { label: 'Domains', color: palette.primary },
} satisfies ChartConfig

function AttackVectorChart() {
  const { state } = useAppState()
  const [activeIdx, setActiveIdx] = useState<number | undefined>(undefined)

  const data = useMemo(() => {
    // Extract generation method from case titles (format: "Suspicious {method}: {domain}")
    const counts: Partial<Record<GenerationMethod, number>> = {}
    for (const c of state.cases) {
      const match = c.title.match(/^Suspicious ([^:]+):/)
      if (match) {
        const method = match[1] as GenerationMethod
        if (method in METHOD_LABELS) {
          counts[method] = (counts[method] ?? 0) + 1
        }
      }
    }
    return (Object.entries(counts) as [GenerationMethod, number][])
      .sort(([, a], [, b]) => b - a)
      .map(([method, value]) => ({
        name: METHOD_LABELS[method],
        value,
        fill: METHOD_COLORS[method],
      }))
  }, [state.cases])

  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Radar className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Attack Vectors</span>
      </div>
      <div className="mb-5 text-sm text-text-secondary">Typosquatting techniques that produced threats</div>
      <div className="flex flex-col items-center">
        <div className="relative size-[170px]">
          <ChartContainer config={attackVectorConfig} className="h-full w-full">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="44%"
                outerRadius="74%"
                paddingAngle={3}
                strokeWidth={0}
                activeIndex={activeIdx}
                activeShape={renderActiveShape}
                onMouseEnter={(_: unknown, index: number) => setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(undefined)}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-[10px] text-text-secondary">threats</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {data.map((s, index) => {
            const isActive = activeIdx === index
            const isDimmed = activeIdx !== undefined && !isActive
            return (
              <div
                key={s.name}
                className={`flex items-center gap-1.5 cursor-pointer transition-all duration-200 ease-[var(--ease-standard)] ${isDimmed ? 'opacity-35 scale-100' : isActive ? 'opacity-100 scale-110' : 'opacity-100 scale-100'}`}
                onMouseEnter={() => setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(undefined)}
              >
                <span
                  className={`rounded-full shrink-0 transition-all duration-200 ${isActive ? 'size-3 shadow-[0_0_8px_currentColor]' : 'size-2'}`}
                  style={{ background: s.fill, color: s.fill }}
                />
                <span className={`transition-all duration-200 ${isActive ? 'text-foreground text-xs font-semibold' : 'text-text-secondary text-[11px]'}`}>
                  {s.name}
                </span>
                <span className={`transition-all duration-200 tabular-nums ${isActive ? 'text-foreground text-xs font-bold' : 'text-text-secondary text-[11px]'}`}>
                  {s.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// === Scan Funnel ===

function ScanFunnel() {
  const { state } = useAppState()
  const meta = state.scanMeta
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!meta) return null

  const highCount = state.cases.filter((c) => c.priority === 'Critical' || c.priority === 'High').length
  const mediumCount = state.cases.filter((c) => c.priority === 'Medium').length
  const lowCount = state.cases.filter((c) => c.priority === 'Low').length

  const stages = [
    { label: 'Generated', value: meta.totalProbed, color: 'var(--text-secondary)', desc: 'variant domains' },
    { label: 'Resolving', value: meta.totalResolved, color: 'var(--info)', desc: 'active DNS' },
    { label: 'Actionable', value: meta.totalActionable, color: 'var(--primary)', desc: 'medium + high risk' },
    { label: 'High Risk', value: highCount, color: 'var(--destructive)', desc: 'critical/high priority' },
  ]

  const maxValue = Math.max(...stages.map((s) => s.value), 1)

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Radar className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Scan Funnel</span>
      </div>
      <div className="mb-5 text-sm text-text-secondary">From variant generation to confirmed threats</div>
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const pct = (stage.value / maxValue) * 100
          return (
            <div key={stage.label} className="group cursor-default">
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">{stage.label}</span>
                  <span className="text-[11px] text-text-tertiary">{stage.desc}</span>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums group-hover:scale-110 transition-transform duration-200 origin-right">{stage.value}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-surface-alt overflow-hidden group-hover:h-3.5 transition-all duration-200">
                <div
                  className="h-full rounded-full transition-all ease-[var(--ease-spring)] group-hover:brightness-125 group-hover:shadow-[0_0_12px_currentColor]"
                  style={{
                    width: mounted ? `${pct}%` : '0%',
                    backgroundColor: stage.color,
                    color: stage.color,
                    transitionDuration: `${600 + i * 150}ms`,
                    transitionDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {/* Conversion callout */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
        <span>Threat rate: <span className="font-semibold text-foreground">{meta.totalProbed > 0 ? Math.round((meta.totalActionable / meta.totalProbed) * 100) : 0}%</span> of variants are actionable</span>
        <span>{highCount} high · {mediumCount} medium · {lowCount} low</span>
      </div>
    </div>
  )
}

// === Signal Coverage Radar ===

import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarShape } from 'recharts'

const signalRadarConfig = {
  coverage: { label: 'Coverage', color: palette.primary },
} satisfies ChartConfig

function SignalCoverageRadar() {
  const { state } = useAppState()

  const data = useMemo(() => {
    const totalCases = state.cases.length
    if (totalCases === 0) return []

    // Count how many cases have evidence from each source type
    const sourceCounts: Record<string, Set<string>> = {
      DNS: new Set(),
      RDAP: new Set(),
      Certificates: new Set(),
      'Threat Intel': new Set(),
      Keywords: new Set(),
      Homoglyphs: new Set(),
    }

    for (const e of state.evidence) {
      switch (e.type) {
        case 'dns_record': sourceCounts.DNS.add(e.caseId); break
        case 'whois_snapshot': sourceCounts.RDAP.add(e.caseId); break
        case 'cert_log': sourceCounts.Certificates.add(e.caseId); break
        case 'threat_intel': sourceCounts['Threat Intel'].add(e.caseId); break
        case 'text_snippet':
          // Text snippets include keyword and homoglyph signals
          if (e.value.toLowerCase().includes('keyword') || e.value.toLowerCase().includes('credential') || e.value.toLowerCase().includes('suspicious keyword')) {
            sourceCounts.Keywords.add(e.caseId)
          }
          if (e.value.toLowerCase().includes('homoglyph') || e.value.toLowerCase().includes('similarity')) {
            sourceCounts.Homoglyphs.add(e.caseId)
          }
          break
      }
    }

    return Object.entries(sourceCounts).map(([source, caseIds]) => ({
      source,
      coverage: Math.round((caseIds.size / totalCases) * 100),
      count: caseIds.size,
    }))
  }, [state.cases.length, state.evidence])

  if (data.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2.5 mb-1">
        <Radar className="size-4 text-text-secondary" />
        <span className="text-base font-semibold text-foreground">Signal Coverage</span>
      </div>
      <div className="mb-2 text-sm text-text-secondary">Enrichment source hit rate across cases</div>
      <div className="h-[260px] w-full">
        <ChartContainer config={signalRadarConfig} className="h-full w-full">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="source"
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 9 }}
              tickCount={4}
              axisLine={false}
            />
            <RadarShape
              name="Coverage %"
              dataKey="coverage"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Tooltip
              offset={20}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="rounded-lg border border-border p-2.5 shadow-lg" style={{ backgroundColor: '#161616', zIndex: 20 }}>
                    <p className="text-xs font-medium text-foreground">{d.source}</p>
                    <p className="text-xs text-text-secondary">{d.coverage}% of cases ({d.count} hits)</p>
                  </div>
                )
              }}
            />
          </RechartsRadarChart>
        </ChartContainer>
      </div>
    </div>
  )
}

// === Risk vs Similarity Scatter ===

import { ScatterChart, Scatter, ZAxis } from 'recharts'
import { computeSimilarity } from '@/lib/scan-engine'

const scatterChartConfig = {
  risk: { label: 'Risk Score', color: palette.primary },
} satisfies ChartConfig

const THREAT_COLORS: Record<string, string> = {
  Phishing: 'var(--destructive)',
  Impersonation: 'var(--primary)',
  Scam: 'var(--info)',
  Counterfeit: 'var(--success)',
  'Policy Abuse': 'var(--text-secondary)',
}

function RiskSimilarityScatter() {
  const { state } = useAppState()
  const brandDomain = state.scanMeta?.brandDomain ?? ''

  const dataByType = useMemo(() => {
    const groups: Record<string, { x: number; y: number; domain: string; threatType: string }[]> = {}
    const brandBase = brandDomain.split('.')[0]

    for (const c of state.cases) {
      const domain = state.domains.find((d) => d.id === c.linkedDomainId)
      const domainName = domain?.domainName ?? ''
      const domainBase = domainName.split('.')[0]

      // Compute similarity directly
      const similarity = brandBase && domainBase
        ? Math.round(computeSimilarity(domainBase, brandBase) * 100)
        : 50

      const tt = c.threatType
      if (!groups[tt]) groups[tt] = []
      groups[tt].push({
        x: similarity,
        y: c.riskScore,
        domain: domainName || c.title.split(': ')[1] || c.id,
        threatType: tt,
      })
    }
    return groups
  }, [state.cases, state.domains, brandDomain])

  const allTypes = Object.keys(dataByType)
  if (allTypes.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <ShieldAlert className="size-4 text-text-secondary" />
        <span className="text-sm font-semibold text-foreground">Risk vs Similarity</span>
      </div>
      <div className="mb-2 text-xs text-text-secondary">Visual deception vs threat severity</div>
      <div className="h-[200px] w-full">
        <ChartContainer config={scatterChartConfig} className="h-full w-full">
          <ScatterChart margin={{ top: 5, right: 5, bottom: 2, left: 0 }}>
            <CartesianGrid strokeDasharray={chartTheme.grid.strokeDasharray} stroke={chartTheme.grid.stroke} />
            <XAxis
              type="number"
              dataKey="x"
              name="Similarity"
              domain={[0, 100]}
              axisLine={chartTheme.axisLine}
              tickLine={chartTheme.tickLine}
              tick={chartTheme.tick}
              label={{ value: 'Similarity %', position: 'insideBottom', offset: -2, style: { fill: 'var(--text-tertiary)', fontSize: 10 } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Risk Score"
              domain={[0, 100]}
              axisLine={chartTheme.axisLine}
              tickLine={chartTheme.tickLine}
              tick={chartTheme.tick}
              width={30}
              label={{ value: 'Risk', angle: -90, position: 'insideLeft', offset: 10, style: { fill: 'var(--text-tertiary)', fontSize: 10 } }}
            />
            <ZAxis range={[50, 50]} />
            <Tooltip
              offset={15}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="rounded-lg border border-border p-2.5 shadow-lg" style={{ backgroundColor: '#161616', zIndex: 20 }}>
                    <p className="text-xs font-medium text-foreground font-mono">{d.domain}</p>
                    <p className="text-xs text-text-secondary mt-1">Similarity: {d.x}% · Risk: {d.y}</p>
                    <p className="text-xs text-text-secondary">{d.threatType}</p>
                  </div>
                )
              }}
            />
            {allTypes.map((tt, i) => (
              <Scatter
                key={tt}
                name={tt}
                data={dataByType[tt]}
                fill={THREAT_COLORS[tt] ?? 'var(--text-secondary)'}
                fillOpacity={0.8}
                strokeWidth={0}
                animationDuration={600}
                animationBegin={i * 200}
                animationEasing="ease-out"
              />
            ))}
          </ScatterChart>
        </ChartContainer>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {allTypes.map((tt) => (
          <div key={tt} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
            <span className="size-2 rounded-full shrink-0" style={{ background: THREAT_COLORS[tt] ?? 'var(--text-secondary)' }} />
            {tt}
          </div>
        ))}
      </div>
    </div>
  )
}

// === Recent Activity ===

function ActivityRow({
  ev,
  index,
}: {
  ev: { id: string; date: string; label: string; detail: string; status: CaseStatus | ActionStatus }
  index: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 + index * 80)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div
      className={`group relative flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0 rounded-md px-2 -mx-2 transition-all duration-300 ease-[var(--ease-out)] hover:bg-surface-hover ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}`}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 rounded-full bg-primary transition-all duration-200 group-hover:h-5" />
      <div className="min-w-0 flex-1 pl-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">{ev.label}</span>
          <StatusChip value={ev.status as CaseStatus} type="status" />
        </div>
        <p className="text-sm text-text-secondary truncate mt-0.5 group-hover:text-foreground/80 transition-colors duration-200">{ev.detail}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground group-hover:text-text-secondary transition-colors duration-200">
        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    </div>
  )
}

function RecentActivity() {
  const { state } = useAppState()

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

  if (events.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-1 text-base font-semibold text-foreground">Recent Case Activity</div>
      <div className="mb-5 text-sm text-text-secondary">Latest updates across the case queue</div>
      <div className="space-y-1">
        {events.map((ev, i) => (
          <ActivityRow key={ev.id} ev={ev} index={i} />
        ))}
      </div>
    </div>
  )
}

// === Overview Page ===

export default function Overview() {
  const { state } = useAppState()

  const statCards = useMemo((): StatDef[] => {
    const openCases = state.cases.filter((c) => c.status !== 'Closed').length
    const criticalHigh = state.cases.filter((c) => (c.priority === 'Critical' || c.priority === 'High') && c.status !== 'Closed').length
    const pendingTriage = state.cases.filter((c) => c.triageStatus === 'pending' || c.triageStatus === 'manual-review').length
    const pendingActions = state.enforcementActions.filter((a) => a.status !== 'Resolved' && a.status !== 'Denied').length

    return [
      {
        title: 'Open cases',
        value: openCases,
        icon: ShieldAlert,
        detail: `${criticalHigh} critical/high`,
      },
      {
        title: 'High risk',
        value: criticalHigh,
        icon: Flame,
        detail: 'critical + high priority',
      },
      {
        title: 'Pending triage',
        value: pendingTriage,
        icon: Globe,
        detail: pendingTriage > 0 ? 'awaiting review' : 'all triaged',
      },
      {
        title: 'Enforcement',
        value: pendingActions,
        icon: Clock,
        detail: 'active actions',
      },
    ]
  }, [state])

  // Case status distribution
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

  // Threat type distribution
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
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Security <span className="text-primary">overview</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Program health, threat landscape, and operational metrics across all properties.
        </p>
      </div>

      {/* Scan Summary */}
      <ScanBanner />

      {/* Stat cards */}
      <StatsStrip stats={statCards} />

      {/* AI Triage */}
      <TriageCard />

      {/* Scan Funnel + Signal Coverage Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScanFunnel />
        <SignalCoverageRadar />
      </div>

      {/* Pipeline + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CasePipelineChart data={pipelineData} />
        </div>
        <div className="lg:col-span-2">
          <RiskDistributionCard />
        </div>
      </div>

      {/* Vendor pipeline + Evidence sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VendorPipelineChart />
        <EvidenceSourcesChart />
      </div>

      {/* Risk vs Similarity + Threat breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RiskSimilarityScatter />
        </div>
        <div className="lg:col-span-2">
          <ThreatBreakdownChart data={threatData} />
        </div>
      </div>

      {/* Attack vectors + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <AttackVectorChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
