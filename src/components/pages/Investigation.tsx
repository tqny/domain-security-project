import { useState, useMemo } from 'react'
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
} from 'lucide-react'

// === Evidence type icons ===

const evidenceIcons: Record<string, React.ReactNode> = {
  screenshot: <Camera className="size-4" />,
  url: <LinkIcon className="size-4" />,
  text_snippet: <FileText className="size-4" />,
  dns_record: <Server className="size-4" />,
  whois_snapshot: <Globe className="size-4" />,
  cert_log: <Shield className="size-4" />,
}

const evidenceLabels: Record<string, string> = {
  screenshot: 'Screenshot',
  url: 'URL',
  text_snippet: 'Text Snippet',
  dns_record: 'DNS Record',
  whois_snapshot: 'WHOIS Snapshot',
  cert_log: 'Certificate Log',
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
      label: `${evidenceLabels[ev.type]} collected`,
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
  triaged: 'bg-chart-2',
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

// === Page ===

export default function Investigation() {
  const { state, updateCaseStatus } = useAppState()
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    state.cases.find((c) => c.status === 'Investigating')?.id ?? state.cases[0]?.id ?? null
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

  if (!selectedCase) {
    return (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Investigation</h1>
        <p className="mt-1 text-sm text-text-secondary">No cases available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header + Case selector */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Investigation</h1>
          <p className="mt-1 text-sm text-text-secondary">Case deep-dive and analysis.</p>
        </div>
        <div className="relative">
          <select
            value={selectedCaseId ?? ''}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="h-9 appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
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

      {/* Case info strip */}
      <div className="rounded-xl bg-surface p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{selectedCase.title}</h2>
            <p className="mt-1 text-sm text-text-secondary leading-relaxed">{selectedCase.summary}</p>
          </div>
          <div className="shrink-0 text-right space-y-1">
            <div className="font-mono text-xs text-muted-foreground">{selectedCase.id}</div>
            <StatusChip value={selectedCase.status} type="status" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <InfoPill label="Channel" value={selectedCase.channel} />
          <InfoPill label="Threat" value={selectedCase.threatType} />
          <InfoPill label="Risk">
            <span className={selectedCase.riskScore >= 80 ? 'text-destructive font-medium' : selectedCase.riskScore >= 60 ? 'text-warning' : 'text-foreground'}>
              {selectedCase.riskScore}/100
            </span>
          </InfoPill>
          <InfoPill label="Priority">
            <StatusChip value={selectedCase.priority} type="priority" />
          </InfoPill>
          <InfoPill label="Owner" value={selectedCase.owner || 'Unassigned'} />
          <InfoPill label="Created" value={formatDate(selectedCase.createdAt)} />
          {linkedDomain && <InfoPill label="Domain" value={linkedDomain.domainName} />}
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — Signal Timeline (hero) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Timeline */}
          <section className="rounded-xl bg-surface p-5">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Signal Timeline — {timeline.length} events
            </h3>
            <div className="relative space-y-0">
              {timeline.map((event, i) => (
                <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Connector line */}
                  {i < timeline.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border-strong/40" />
                  )}
                  {/* Dot */}
                  <div className={`relative z-10 mt-1 size-[15px] shrink-0 rounded-full border-2 border-background ${dotColors[event.type]}`} />
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{event.label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(event.date)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-text-secondary leading-relaxed line-clamp-2">{event.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Evidence */}
          <section className="rounded-xl bg-surface p-5">
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Evidence — {caseEvidence.length} items
            </h3>
            {caseEvidence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No evidence collected yet.</p>
            ) : (
              <div className="space-y-3">
                {caseEvidence.map((ev) => (
                  <div key={ev.id} className="flex gap-3 rounded-xl bg-background p-3">
                    <div className="mt-0.5 shrink-0 text-text-secondary">
                      {evidenceIcons[ev.type] ?? <FileText className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium text-primary/80">{evidenceLabels[ev.type]}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(ev.capturedAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary leading-relaxed">{ev.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column — AI Analysis + Decision */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Analysis */}
          <section className="rounded-xl bg-surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5 text-primary/70" />
              AI Analysis
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{selectedCase.aiSummary}</p>
            <div className="mt-4 rounded-xl bg-background p-3">
              <span className="text-xs font-medium text-primary/80">Suggested Action</span>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">{selectedCase.aiSuggestedAction}</p>
            </div>
          </section>

          {/* Decision Module */}
          <section className="rounded-xl bg-surface p-5">
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
                      onClick={() => updateCaseStatus(selectedCase.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Enforcement actions summary */}
              {caseActions.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs text-muted-foreground">
                    Enforcement Actions ({caseActions.length})
                  </label>
                  <div className="space-y-2">
                    {caseActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
                        <div>
                          <span className="text-sm text-foreground">{action.actionType}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {state.vendors.find((v) => v.id === action.vendorId)?.name}
                          </span>
                        </div>
                        <StatusChip value={action.status as 'New'} type="status" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Risk Assessment */}
          <section className="rounded-xl bg-surface p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="size-3.5" />
              Risk Assessment
            </h3>
            <div className="space-y-3">
              {/* Risk bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <span className={`text-lg font-semibold ${selectedCase.riskScore >= 80 ? 'text-destructive' : selectedCase.riskScore >= 60 ? 'text-warning' : 'text-foreground'}`}>
                    {selectedCase.riskScore}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-[280ms] ${selectedCase.riskScore >= 80 ? 'bg-destructive' : selectedCase.riskScore >= 60 ? 'bg-warning' : 'bg-primary'}`}
                    style={{ width: `${selectedCase.riskScore}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Evidence items</span>
                <span className="text-foreground">{caseEvidence.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Enforcement actions</span>
                <span className="text-foreground">{caseActions.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Days open</span>
                <span className="text-foreground">
                  {Math.ceil((new Date(selectedCase.closedAt ?? Date.now()).getTime() - new Date(selectedCase.createdAt).getTime()) / 86400000)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

// === Helper components ===

function InfoPill({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground">{children ?? value}</span>
    </span>
  )
}
