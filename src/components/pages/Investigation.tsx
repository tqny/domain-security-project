import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { Case, Evidence, EnforcementAction } from '@/types'
import StatusChip from '@/components/shared/StatusChip'
import { Button } from '@/components/ui/button'
import {
  Camera,
  Globe,
  FileText,
  Shield,
  Link as LinkIcon,
  Server,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Fingerprint,
  Dna,
  Radar,
  ShieldAlert,
  Activity,
  Clock,
  User,
  ExternalLink,
} from 'lucide-react'

// === Evidence type icons ===

const evidenceIcons: Record<string, React.ReactNode> = {
  screenshot: <Camera className="size-4" />,
  url: <LinkIcon className="size-4" />,
  text_snippet: <FileText className="size-4" />,
  dns_record: <Server className="size-4" />,
  whois_snapshot: <Globe className="size-4" />,
  cert_log: <Shield className="size-4" />,
  threat_intel: <ShieldAlert className="size-4" />,
}

const evidenceLabels: Record<string, string> = {
  screenshot: 'Screenshot',
  url: 'URL',
  text_snippet: 'Text Snippet',
  dns_record: 'DNS Record',
  whois_snapshot: 'WHOIS / RDAP',
  cert_log: 'Certificate Log',
  threat_intel: 'Threat Intel',
}

// === Timeline event builder ===

interface TimelineEvent {
  id: string
  date: string
  label: string
  detail: string
  type: 'created' | 'triaged' | 'evidence' | 'note' | 'enforcement' | 'closed'
}

function buildTimeline(
  caseData: Case,
  evidence: Evidence[],
  actions: EnforcementAction[]
): TimelineEvent[] {
  const events: TimelineEvent[] = []

  events.push({
    id: 'created',
    date: caseData.createdAt,
    label: 'Case created',
    detail: caseData.title,
    type: 'created',
  })

  if (caseData.triagedAt) {
    events.push({
      id: 'triaged',
      date: caseData.triagedAt,
      label: 'Triaged',
      detail: `Priority set to ${caseData.priority}`,
      type: 'triaged',
    })
  }

  for (const ev of evidence) {
    events.push({
      id: ev.id,
      date: ev.capturedAt,
      label: `${evidenceLabels[ev.type] ?? ev.type} collected`,
      detail: ev.value,
      type: 'evidence',
    })
  }

  for (const note of caseData.notes) {
    events.push({
      id: note.id,
      date: note.createdAt,
      label: `Note by ${note.author}`,
      detail: note.text,
      type: 'note',
    })
  }

  for (const action of actions) {
    events.push({
      id: action.id,
      date: action.requestedAt,
      label: `${action.actionType} — ${action.status}`,
      detail: action.notes.length > 0 ? action.notes[0].text : 'Action initiated',
      type: 'enforcement',
    })
  }

  if (caseData.closedAt) {
    events.push({
      id: 'closed',
      date: caseData.closedAt,
      label: 'Case closed',
      detail: 'Investigation complete',
      type: 'closed',
    })
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// === Timeline dot colors ===

const dotColors: Record<TimelineEvent['type'], string> = {
  created: 'bg-primary',
  triaged: 'bg-info',
  evidence: 'bg-text-secondary',
  note: 'bg-muted-foreground',
  enforcement: 'bg-warning',
  closed: 'bg-success',
}

// === Format helpers ===

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// === Scan signal parser — derive from evidence and case title ===

interface ScanIntel {
  generationMethod: string | null
  brandDomain: string | null
  signals: { type: string; label: string; present: boolean }[]
}

function parseScanIntel(caseData: Case, evidence: Evidence[]): ScanIntel | null {
  // Cases from scan have title pattern: "Suspicious {method}: {domain}"
  const titleMatch = caseData.title.match(/^Suspicious (\S+): (.+)$/)
  if (!titleMatch) return null

  const generationMethod = titleMatch[1]

  // Extract brand domain from summary: "targeting {brandDomain}"
  const brandMatch = caseData.summary.match(/targeting (\S+?)\./)
  const brandDomain = brandMatch ? brandMatch[1] : null

  const signalTypes = [
    { type: 'dns', label: 'DNS', evidenceType: 'dns_record' },
    { type: 'rdap', label: 'RDAP', evidenceType: 'whois_snapshot' },
    { type: 'cert', label: 'Certificate', evidenceType: 'cert_log' },
    { type: 'threat_intel', label: 'Threat Intel', evidenceType: 'threat_intel' },
    { type: 'similarity', label: 'Similarity', evidenceType: null },
    { type: 'keyword', label: 'Keyword', evidenceType: null },
  ]

  const signals = signalTypes.map(({ type, label, evidenceType }) => {
    const present = evidenceType
      ? evidence.some((e) => e.type === evidenceType)
      : type === 'similarity'
        ? evidence.some((e) => e.value.toLowerCase().includes('similarity'))
        : evidence.some((e) => e.value.toLowerCase().includes('keyword'))
    return { type, label, present }
  })

  return { generationMethod, brandDomain, signals }
}

// === Animated counter ===

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const start = ref.current
    const diff = value - start
    if (diff === 0) return
    const duration = 600
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(tick)
      else ref.current = value
    }
    requestAnimationFrame(tick)
  }, [value])

  return <span className={className}>{display}</span>
}

// === Risk Gauge (semicircle) ===

function RiskGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const rotation = (animatedScore / 100) * 180
  const color = score >= 70 ? 'var(--destructive)' : score >= 45 ? 'var(--warning)' : 'var(--success)'
  const label = score >= 70 ? 'Critical' : score >= 45 ? 'Elevated' : 'Low'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-28 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 rounded-full border-[6px] border-border" style={{ clipPath: 'inset(0 0 50% 0)' }} />
        {/* Filled arc */}
        <div
          className="absolute inset-0 rounded-full border-[6px] border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: rotation > 90 ? color : 'transparent',
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: `rotate(${rotation - 90}deg)`,
            transition: 'transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            clipPath: 'inset(0 0 50% 0)',
          }}
        />
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <AnimatedNumber value={score} className="text-2xl font-bold text-foreground tabular-nums" />
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>{label}</span>
        </div>
      </div>
    </div>
  )
}

// === Generation method labels ===

const methodLabels: Record<string, string> = {
  'char-substitution': 'Character Substitution',
  'char-insertion': 'Character Insertion',
  'char-deletion': 'Character Deletion',
  'char-transposition': 'Character Transposition',
  homoglyph: 'Homoglyph',
  keyword: 'Keyword Injection',
  'tld-variation': 'TLD Variation',
  hyphenation: 'Hyphenation',
}

// === Expandable stat row ===

function ExpandableStat({
  label,
  count,
  delayMs,
  children,
}: {
  label: string
  count: number
  delayMs: number
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="animate-in fade-in duration-300"
      style={{ animationDelay: `${delayMs}ms`, animationFillMode: 'backwards' }}
    >
      <button
        onClick={() => count > 0 && setOpen(!open)}
        className={`flex w-full items-center justify-between text-xs py-1 transition-colors duration-[var(--duration-fast)] ${count > 0 ? 'cursor-pointer hover:text-primary' : 'cursor-default'}`}
      >
        <span className="flex items-center gap-1 text-muted-foreground">
          {count > 0 && (
            <ChevronDown
              className={`size-3 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
            />
          )}
          {label}
        </span>
        <AnimatedNumber value={count} className="text-foreground tabular-nums" />
      </button>
      <div
        className="overflow-hidden transition-all duration-200 ease-[var(--ease-standard)]"
        style={{ maxHeight: open ? `${count * 36 + 8}px` : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pl-4 border-l-2 border-border ml-1 mt-1 mb-1">
          {children}
        </div>
      </div>
    </div>
  )
}

// === Page ===

export default function Investigation() {
  const { state, updateCaseStatus } = useAppState()
  const [searchParams] = useSearchParams()
  const caseFromUrl = searchParams.get('case')

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    (caseFromUrl && state.cases.find((c) => c.id === caseFromUrl) ? caseFromUrl : null)
    ?? state.cases.find((c) => c.status === 'Investigating')?.id
    ?? state.cases[0]?.id
    ?? null
  )

  const selectedCase = selectedCaseId
    ? state.cases.find((c) => c.id === selectedCaseId) ?? null
    : null

  const caseEvidence = useMemo(
    () => (selectedCaseId ? state.evidence.filter((e) => e.caseId === selectedCaseId) : []),
    [state.evidence, selectedCaseId]
  )

  const caseActions = useMemo(
    () => (selectedCaseId ? state.enforcementActions.filter((a) => a.caseId === selectedCaseId) : []),
    [state.enforcementActions, selectedCaseId]
  )

  const timeline = useMemo(
    () => (selectedCase ? buildTimeline(selectedCase, caseEvidence, caseActions) : []),
    [selectedCase, caseEvidence, caseActions]
  )

  const linkedDomain = selectedCase?.linkedDomainId
    ? state.domains.find((d) => d.id === selectedCase.linkedDomainId)
    : null

  const scanIntel = useMemo(
    () => (selectedCase ? parseScanIntel(selectedCase, caseEvidence) : null),
    [selectedCase, caseEvidence]
  )

  if (!selectedCase) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="size-10 text-muted-foreground mb-3" />
        <h1 className="text-xl font-semibold text-foreground">No cases available</h1>
        <p className="mt-1 text-sm text-text-secondary">Run a Live Scan to generate cases for investigation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ─── Header + Case Selector ─── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Investigation</h1>
          <p className="mt-1 text-sm text-text-secondary">Case deep-dive and threat analysis.</p>
        </div>
        <div className="relative">
          <select
            value={selectedCaseId ?? ''}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="h-9 appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground transition-colors duration-[var(--duration-fast)] hover:border-border-strong focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
          >
            {state.cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.substring(0, 50)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* ─── Hero Banner: Case Info + Risk Gauge + AI Summary ─── */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex gap-6">
          {/* Left: case metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">{selectedCase.id}</span>
                  <StatusChip value={selectedCase.status} type="status" />
                  <StatusChip value={selectedCase.priority} type="priority" />
                </div>
                <h2 className="text-lg font-semibold text-foreground leading-snug">{selectedCase.title}</h2>
                <p className="mt-1.5 text-sm text-text-secondary leading-relaxed line-clamp-2">{selectedCase.summary}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <InfoPill icon={<Activity className="size-3" />} label="Channel" value={selectedCase.channel} />
              <InfoPill icon={<AlertTriangle className="size-3" />} label="Threat" value={selectedCase.threatType} />
              <InfoPill icon={<User className="size-3" />} label="Owner" value={selectedCase.owner || 'Unassigned'} />
              <InfoPill icon={<Clock className="size-3" />} label="Created" value={formatDate(selectedCase.createdAt)} />
              {linkedDomain && (
                <InfoPill icon={<Globe className="size-3" />} label="Domain" value={linkedDomain.domainName} />
              )}
            </div>
          </div>

          {/* Right: Risk Gauge */}
          <div className="shrink-0 flex flex-col items-center justify-center border-l border-border pl-6">
            <RiskGauge score={selectedCase.riskScore} />
          </div>
        </div>

        {/* AI Summary — amber accent strip */}
        <div className="mt-5 rounded-lg border border-primary/20 bg-accent-muted p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-primary/20 p-1.5">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Analysis</span>
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">Beta</span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{selectedCase.aiSummary}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs font-medium text-primary/80">Recommended:</span>
                <span className="text-xs text-text-secondary">{selectedCase.aiSuggestedAction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Scan Intel Strip (only for scan-originated cases) ─── */}
      {scanIntel && (
        <div className="rounded-xl border border-border bg-surface px-5 py-3.5">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2 text-xs">
              <Radar className="size-3.5 text-primary" />
              <span className="font-medium uppercase tracking-wider text-muted-foreground">Scan Intel</span>
            </div>
            <div className="h-4 w-px bg-border" />
            {scanIntel.generationMethod && (
              <ScanChip
                icon={<Dna className="size-3" />}
                label="Technique"
                value={methodLabels[scanIntel.generationMethod] ?? scanIntel.generationMethod}
                active
              />
            )}
            {scanIntel.brandDomain && (
              <ScanChip
                icon={<Fingerprint className="size-3" />}
                label="Target"
                value={scanIntel.brandDomain}
                active
              />
            )}
            <div className="h-4 w-px bg-border" />
            {scanIntel.signals.map((s) => (
              <SignalDot key={s.type} label={s.label} present={s.present} />
            ))}
          </div>
        </div>
      )}

      {/* ─── Two-Column: Evidence + Timeline | Decision + Risk ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left column (3/5) — Evidence (hero) + Timeline */}
        <div className="lg:col-span-3 space-y-5">
          {/* Evidence */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Shield className="size-3.5" />
              Evidence — {caseEvidence.length} items
            </h3>
            {caseEvidence.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No evidence collected yet.</p>
            ) : (
              <div className="space-y-2">
                {caseEvidence.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="group flex gap-3 rounded-lg bg-background p-3 transition-all duration-[var(--duration-fast)] hover:bg-surface-hover hover:translate-x-0.5"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="mt-0.5 shrink-0 text-text-secondary transition-colors duration-[var(--duration-fast)] group-hover:text-primary">
                      {evidenceIcons[ev.type] ?? <FileText className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium text-primary">{evidenceLabels[ev.type] ?? ev.type}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(ev.capturedAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary leading-relaxed line-clamp-2">{ev.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Signal Timeline */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              Signal Timeline — {timeline.length} events
            </h3>
            <div className="relative space-y-0">
              {timeline.map((event, i) => {
                const isLast = i === timeline.length - 1
                return (
                  <div
                    key={event.id}
                    className="group/tl relative flex gap-4 pb-6 last:pb-0 animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                  >
                    {/* Connector line — grows downward */}
                    {!isLast && (
                      <div
                        className="absolute left-[7px] top-5 bottom-0 w-px origin-top bg-border-strong"
                        style={{
                          animation: `timeline-line-grow 400ms ease-out ${i * 80 + 200}ms backwards`,
                        }}
                      />
                    )}
                    {/* Hover accent bar — offset left to avoid dot overlap */}
                    <div className="absolute -left-2.5 top-0 bottom-0 w-[2px] rounded-full bg-primary opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover/tl:opacity-100" />
                    {/* Dot — pulse on most recent */}
                    <div className={`relative z-10 mt-1 size-[15px] shrink-0 rounded-full border-2 border-background ${dotColors[event.type]} transition-transform duration-[var(--duration-fast)] hover:scale-125 ${isLast ? 'timeline-dot-pulse' : ''}`} />
                    {/* Content */}
                    <div className="min-w-0 flex-1 transition-transform duration-[var(--duration-fast)] group-hover/tl:translate-x-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{event.label}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(event.date)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-text-secondary leading-relaxed line-clamp-2">{event.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Right column (2/5) — Decision + Enforcement + Risk Breakdown */}
        <div className="lg:col-span-2 space-y-5">
          {/* Case Decision */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Case Decision
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs text-muted-foreground">Update Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'Triaged', 'Investigating', 'Enforcement', 'Closed'] as const).map((s) => (
                    <Button
                      key={s}
                      variant={selectedCase.status === s ? 'default' : 'outline'}
                      size="sm"
                      className="transition-all duration-[var(--duration-fast)]"
                      onClick={() => updateCaseStatus(selectedCase.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Enforcement Actions */}
          {caseActions.length > 0 && (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <ExternalLink className="size-3.5" />
                Enforcement Actions ({caseActions.length})
              </h3>
              <div className="space-y-2">
                {caseActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5 transition-colors duration-[var(--duration-fast)] hover:bg-surface-hover">
                    <div>
                      <span className="text-sm text-foreground">{action.actionType}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {state.vendors.find((v) => v.id === action.vendorId)?.name}
                      </span>
                    </div>
                    <StatusChip value={action.status} type="action-status" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Risk Breakdown */}
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="size-3.5" />
              Risk Breakdown
            </h3>
            <div className="space-y-3">
              {/* Risk bar — animated score + grow-from-zero bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Composite Score</span>
                  <AnimatedNumber
                    value={selectedCase.riskScore}
                    className={`text-lg font-semibold tabular-nums ${selectedCase.riskScore >= 70 ? 'text-destructive' : selectedCase.riskScore >= 45 ? 'text-warning' : 'text-foreground'}`}
                  />
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <RiskBar score={selectedCase.riskScore} />
                </div>
              </div>

              {/* Signal strength indicators — staggered bar entrance */}
              {scanIntel && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground mb-2 block">Signal Strength</span>
                  <div className="space-y-1.5">
                    {scanIntel.signals.filter((s) => s.present).map((s, si) => {
                      const strength = s.type === 'dns' || s.type === 'cert' || s.type === 'threat_intel' ? 3 : 2
                      return (
                        <div
                          key={s.type}
                          className="flex items-center justify-between text-xs animate-in fade-in slide-in-from-right-1 duration-300"
                          style={{ animationDelay: `${si * 60 + 300}ms`, animationFillMode: 'backwards' }}
                        >
                          <span className="text-text-secondary">{s.label}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((bar) => (
                              <div
                                key={bar}
                                className={`h-2.5 w-1 rounded-full transition-all duration-300 ${bar <= strength ? 'bg-primary' : 'bg-border'}`}
                                style={{
                                  animation: bar <= strength ? `signal-bar-grow 300ms ease-out ${si * 60 + 400 + bar * 80}ms backwards` : undefined,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Stats — expandable evidence & enforcement */}
              <div className="pt-2 border-t border-border space-y-1">
                <ExpandableStat
                  label="Evidence items"
                  count={caseEvidence.length}
                  delayMs={500}
                >
                  {caseEvidence.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-2 py-1.5 text-xs">
                      <span className="shrink-0 mt-0.5 text-text-secondary">{evidenceIcons[ev.type] ?? <FileText className="size-3.5" />}</span>
                      <span className="min-w-0 flex-1 text-text-secondary truncate" title={ev.value}>{ev.value}</span>
                      <span className="shrink-0 text-muted-foreground">{formatDate(ev.capturedAt)}</span>
                    </div>
                  ))}
                </ExpandableStat>

                <ExpandableStat
                  label="Enforcement actions"
                  count={caseActions.length}
                  delayMs={580}
                >
                  {caseActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between gap-2 py-1.5 text-xs">
                      <span className="text-foreground">{action.actionType}</span>
                      <StatusChip value={action.status} type="action-status" />
                    </div>
                  ))}
                </ExpandableStat>

                <div
                  className="flex items-center justify-between text-xs animate-in fade-in duration-300 py-1"
                  style={{ animationDelay: '660ms', animationFillMode: 'backwards' }}
                >
                  <span className="text-muted-foreground">Days open</span>
                  <AnimatedNumber
                    value={Math.ceil((new Date(selectedCase.closedAt ?? Date.now()).getTime() - new Date(selectedCase.createdAt).getTime()) / 86400000)}
                    className="text-foreground tabular-nums"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// === Animated risk bar (grows from 0 on mount) ===

function RiskBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 50)
    return () => clearTimeout(timer)
  }, [score])

  const color = score >= 70 ? 'var(--destructive)' : score >= 45 ? 'var(--warning)' : 'var(--success)'

  return (
    <div
      className="h-full rounded-full"
      style={{
        width: `${width}%`,
        backgroundColor: color,
        transition: 'width 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    />
  )
}

// === Helper components ===

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-text-secondary">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{value}</span>
    </span>
  )
}

function ScanChip({ icon, label, value, active }: { icon: React.ReactNode; label: string; value: string; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${active ? 'bg-accent-muted text-primary' : 'bg-background text-text-secondary'}`}>
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  )
}

function SignalDot({ label, present }: { label: string; present: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`size-1.5 rounded-full ${present ? 'bg-success' : 'bg-border'}`} />
      <span className={present ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </span>
  )
}
