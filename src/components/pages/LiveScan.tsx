import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { ScanResult, ScanSession, ScanPhase, RiskLevel } from '@/types/scan'
import { generateVariants } from '@/lib/scan-engine'
import { dnsProbeBatch, enrichResolvedBatch } from '@/lib/enrichment'
import { buildAppStateFromScan } from '@/lib/scan-bridge'
import { sampleScanResults, SAMPLE_BRAND, SAMPLE_TOTAL_PROBED, SAMPLE_TOTAL_RESOLVED } from '@/data/sample-scan'
import DataTable, { type Column, type SortState } from '@/components/shared/DataTable'
import FilterBar, { type FilterDef } from '@/components/shared/FilterBar'
import DetailPanel from '@/components/shared/DetailPanel'
import StatusChip from '@/components/shared/StatusChip'
import { DetailRow, DetailSection } from '@/components/shared/DetailHelpers'
import { Button } from '@/components/ui/button'
import {
  Radar,
  Zap,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Activity,
  Target,
} from 'lucide-react'

// === Filter definitions ===

const riskOptions: RiskLevel[] = ['High', 'Medium', 'Low']
const methodOptions = [
  'char-substitution', 'char-insertion', 'char-deletion', 'char-transposition',
  'homoglyph', 'keyword', 'tld-variation', 'hyphenation',
]

const filterDefs: FilterDef[] = [
  { key: 'riskLevel', label: 'Risk Level', options: riskOptions.map((r) => ({ label: r, value: r })) },
  { key: 'method', label: 'Method', options: methodOptions.map((m) => ({ label: m, value: m })) },
]

// === Column definitions ===

const columns: Column<ScanResult>[] = [
  {
    key: 'domain',
    label: 'Domain',
    sortable: true,
    className: 'min-w-[200px]',
    render: (r) => <span className="font-mono text-sm text-foreground">{r.domain}</span>,
  },
  {
    key: 'generationMethod',
    label: 'Method',
    sortable: true,
    className: 'w-[130px]',
    render: (r) => <span className="text-text-secondary text-xs">{r.generationMethod}</span>,
  },
  {
    key: 'similarity',
    label: 'Similarity',
    sortable: true,
    className: 'w-[90px] text-right',
    render: (r) => (
      <span className={r.similarity >= 0.8 ? 'text-destructive font-medium' : r.similarity >= 0.6 ? 'text-warning' : 'text-muted-foreground'}>
        {Math.round(r.similarity * 100)}%
      </span>
    ),
  },
  {
    key: 'dns' as keyof ScanResult,
    label: 'DNS',
    sortable: false,
    className: 'w-[60px] text-center',
    render: (r) => {
      if (r.enrichmentStatus === 'pending' || r.enrichmentStatus === 'enriching') {
        return <Loader2 className="size-4 text-text-tertiary animate-spin mx-auto" />
      }
      const hasDns = r.signals.some((s) => s.type === 'dns')
      return hasDns
        ? <CheckCircle2 className="size-4 text-destructive mx-auto" />
        : <XCircle className="size-4 text-text-tertiary mx-auto" />
    },
  },
  {
    key: 'cert' as keyof ScanResult,
    label: 'Cert',
    sortable: false,
    className: 'w-[60px] text-center',
    render: (r) => {
      if (r.enrichmentStatus === 'pending' || r.enrichmentStatus === 'enriching') {
        return <Loader2 className="size-4 text-text-tertiary animate-spin mx-auto" />
      }
      const hasCert = r.signals.some((s) => s.type === 'cert')
      return hasCert
        ? <CheckCircle2 className="size-4 text-warning mx-auto" />
        : <XCircle className="size-4 text-text-tertiary mx-auto" />
    },
  },
  {
    key: 'intel' as keyof ScanResult,
    label: 'Intel',
    sortable: false,
    className: 'w-[60px] text-center',
    render: (r) => {
      if (r.enrichmentStatus === 'pending' || r.enrichmentStatus === 'enriching') {
        return <Loader2 className="size-4 text-text-tertiary animate-spin mx-auto" />
      }
      const hasThreatIntel = r.signals.some((s) => s.type === 'urlhaus' || s.type === 'otx' || s.type === 'spamhaus')
      return hasThreatIntel
        ? <AlertTriangle className="size-4 text-destructive mx-auto" />
        : <XCircle className="size-4 text-text-tertiary mx-auto" />
    },
  },
  {
    key: 'riskScore',
    label: 'Score',
    sortable: true,
    className: 'w-[70px] text-right',
    render: (r) => {
      if (r.enrichmentStatus === 'pending' || r.enrichmentStatus === 'enriching') {
        return <span className="text-text-tertiary">—</span>
      }
      return (
        <span className={r.riskScore >= 60 ? 'text-destructive font-medium' : r.riskScore >= 30 ? 'text-warning' : 'text-muted-foreground'}>
          {r.riskScore}
        </span>
      )
    },
  },
  {
    key: 'riskLevel',
    label: 'Risk',
    sortable: true,
    className: 'w-[100px]',
    render: (r) => {
      if (r.enrichmentStatus === 'pending' || r.enrichmentStatus === 'enriching') {
        return <span className="text-text-tertiary text-xs">Scanning...</span>
      }
      return <StatusChip value={r.riskLevel} type="risk-level" />
    },
  },
]

// === Sort helper ===

function sortResults(results: ScanResult[], sort: SortState): ScanResult[] {
  return [...results].sort((a, b) => {
    let cmp = 0
    const key = sort.key

    if (key === 'riskScore' || key === 'similarity') {
      cmp = (a[key] as number) - (b[key] as number)
    } else if (key === 'riskLevel') {
      const order: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 }
      cmp = order[a.riskLevel] - order[b.riskLevel]
    } else {
      const aVal = String(a[key as keyof ScanResult] ?? '')
      const bVal = String(b[key as keyof ScanResult] ?? '')
      cmp = aVal.localeCompare(bVal)
    }

    return sort.direction === 'asc' ? cmp : -cmp
  })
}

// === Detail Panel Content ===

function ScanResultDetail({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-5">
      {/* Risk Score Visual */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Score</span>
          <span className={`text-2xl font-bold ${result.riskScore >= 60 ? 'text-destructive' : result.riskScore >= 30 ? 'text-warning' : 'text-success'}`}>
            {result.riskScore}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${result.riskScore >= 60 ? 'bg-destructive' : result.riskScore >= 30 ? 'bg-warning' : 'bg-success'}`}
            style={{ width: `${result.riskScore}%` }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <DetailRow label="Domain" value={result.domain} mono />
        <DetailRow label="Brand Domain" value={result.brandDomain} />
        <DetailRow label="Generation Method" value={result.generationMethod} />
        <DetailRow label="Similarity" value={`${Math.round(result.similarity * 100)}%`} />
        <DetailRow label="Risk Level">
          <StatusChip value={result.riskLevel} type="risk-level" />
        </DetailRow>
      </div>

      {/* Signal Breakdown */}
      <DetailSection title="Signal Breakdown">
        <div className="space-y-2">
          {result.signals.map((signal, i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-lg bg-background p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">{signal.label}</div>
                <div className="text-xs text-text-secondary mt-0.5">{signal.value}</div>
              </div>
              {signal.scoreContribution > 0 && (
                <span className="shrink-0 rounded-full bg-warning-muted px-2 py-0.5 text-xs font-semibold text-warning">
                  +{signal.scoreContribution}
                </span>
              )}
            </div>
          ))}
          {result.signals.length === 0 && (
            <p className="text-sm text-muted-foreground">No signals detected.</p>
          )}
        </div>
      </DetailSection>

      {/* Analyst Summary */}
      <DetailSection title="Analyst Summary">
        <p className="text-sm text-text-secondary leading-relaxed">{result.analystSummary}</p>
      </DetailSection>

      {/* Recommended Action */}
      <DetailSection title="Recommended Action">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium text-foreground">{result.recommendedAction}</p>
        </div>
      </DetailSection>

      {/* Raw Evidence */}
      {result.signals.some((s) => s.raw) && (
        <DetailSection title="Raw Evidence">
          <div className="space-y-2">
            {result.signals
              .filter((s) => s.raw)
              .map((signal, i) => (
                <details key={i} className="rounded-lg border border-border">
                  <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-text-secondary hover:text-foreground">
                    {signal.label}
                  </summary>
                  <pre className="px-3 pb-3 text-xs text-text-tertiary overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(signal.raw, null, 2)}
                  </pre>
                </details>
              ))}
          </div>
        </DetailSection>
      )}
    </div>
  )
}

// === Helper sub-components ===

// === Confirmation Modal ===

function ConfirmModal({ open, onConfirm, onCancel }: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-floating"
        role="dialog"
        aria-modal="true"
        aria-label="Push to Sentinel confirmation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-warning-muted">
            <AlertTriangle className="size-5 text-warning" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Push to Sentinel</h3>
        </div>
        <p className="text-sm text-text-secondary mb-2">
          Push scan results into the Sentinel workflow? This will create cases, domains, evidence, and enforcement actions from your scan.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          The top 5 highest-risk domains will need AI triage review on the Dashboard.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>
            <Zap className="size-4 mr-2" />
            Push to Sentinel
          </Button>
        </div>
      </div>
    </div>
  )
}

// === Stat Card ===

function StatCard({ label, value, icon: Icon, highlight }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border bg-surface p-5 transition-all duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:shadow-medium ${highlight ? 'border-l-[3px] border-l-primary border-t-border border-r-border border-b-border' : 'border-border'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="size-4 text-text-tertiary" />
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  )
}

// === CSV Export ===

function csvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function exportCsv(results: ScanResult[]) {
  const headers = ['Domain', 'Method', 'Similarity', 'DNS', 'Cert', 'ThreatIntel', 'Score', 'Risk', 'Summary']
  const rows = results.map((r) => [
    csvField(r.domain),
    csvField(r.generationMethod),
    `${Math.round(r.similarity * 100)}%`,
    r.signals.some((s) => s.type === 'dns') ? 'Yes' : 'No',
    r.signals.some((s) => s.type === 'cert') ? 'Yes' : 'No',
    r.signals.some((s) => s.type === 'urlhaus' || s.type === 'otx' || s.type === 'spamhaus') ? 'Yes' : 'No',
    String(r.riskScore),
    r.riskLevel,
    csvField(r.analystSummary),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `scan-results-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// === Suggested Targets ===

const SUGGESTED_TARGETS = [
  { domain: 'paypal.com', label: 'PayPal' },
  { domain: 'coinbase.com', label: 'Coinbase' },
  { domain: 'chase.com', label: 'Chase' },
  { domain: 'microsoft.com', label: 'Microsoft' },
  { domain: 'bankofamerica.com', label: 'BofA' },
  { domain: 'instagram.com', label: 'Instagram' },
  { domain: 'metamask.io', label: 'MetaMask' },
  { domain: 'amazon.com', label: 'Amazon' },
  { domain: 'wellsfargo.com', label: 'Wells Fargo' },
  { domain: 'netflix.com', label: 'Netflix' },
]

// === Enrichment pipeline steps for rotating ticker ===

const PROBE_STEPS = [
  { label: 'Resolving DNS via Google DNS-over-HTTPS', detail: 'A/AAAA record lookups for each variant' },
  { label: 'Checking domain resolution status', detail: 'Identifying active infrastructure' },
  { label: 'Filtering to resolving domains', detail: 'Non-resolving variants scored locally only' },
]

const ENRICH_STEPS = [
  { label: 'Querying RDAP registration data', detail: 'Registrar, creation date, expiration via rdap.org' },
  { label: 'Scanning Certificate Transparency logs', detail: 'SSL/TLS certificates via crt.sh' },
  { label: 'Checking Spamhaus Domain Blocklist', detail: 'Phishing, malware, and botnet C&C classification' },
  { label: 'Querying URLhaus malicious URL database', detail: 'abuse.ch threat intelligence feed' },
  { label: 'Pulling AlienVault OTX threat reports', detail: 'Community-sourced threat intelligence' },
  { label: 'Computing Levenshtein similarity scores', detail: 'Normalized string distance to brand domain' },
  { label: 'Detecting homoglyph substitutions', detail: 'Visual lookalike character analysis' },
  { label: 'Analyzing credential-themed keywords', detail: 'Login, verify, secure, banking pattern detection' },
  { label: 'Scoring compound threat signals', detail: 'DNS + cert + fresh registration = high confidence' },
  { label: 'Generating AI analyst summaries', detail: 'Signal-aware narrative for each threat' },
]

function useRotatingIndex(items: unknown[], intervalMs: number, active: boolean): number {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!active) return
    setIndex(0)
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [items.length, intervalMs, active])
  return index
}

// === Scan Progress (two-phase funnel with enrichment ticker) ===

function ScanProgress({
  phase, probeCount, totalVariants, resolvedCount, enrichedCount, enrichTotal,
}: {
  phase: ScanPhase
  probeCount: number
  totalVariants: number
  resolvedCount: number
  enrichedCount: number
  enrichTotal: number
}) {
  const isProbing = phase === 'probing'
  const isEnriching = phase === 'enriching'
  const isActive = isProbing || isEnriching

  const steps = isEnriching ? ENRICH_STEPS : PROBE_STEPS
  const tickerIndex = useRotatingIndex(steps, 2800, isActive)
  const currentStep = steps[tickerIndex]

  if (phase === 'idle' || phase === 'complete') return null

  let label = ''
  let progress = 0
  let detail = ''

  switch (phase) {
    case 'generating':
      label = 'Generating domain variants...'
      break
    case 'probing':
      label = 'Probing DNS'
      progress = totalVariants > 0 ? (probeCount / totalVariants) * 100 : 0
      detail = `${probeCount} / ${totalVariants}`
      break
    case 'enriching':
      label = 'Enriching active domains'
      progress = enrichTotal > 0 ? (enrichedCount / enrichTotal) * 100 : 0
      detail = `${enrichedCount} / ${enrichTotal}`
      break
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Phase transition message */}
      {isEnriching && enrichedCount === 0 && (
        <div className="text-xs text-primary font-medium">
          {resolvedCount} of {totalVariants} variants resolve → enriching active domains...
        </div>
      )}
      {isProbing && resolvedCount > 0 && (
        <div className="text-xs text-text-secondary">
          {resolvedCount} resolving so far...
        </div>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
          <span>{label}</span>
          <span className="tabular-nums">{detail}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Rotating enrichment ticker */}
      {isActive && currentStep && (
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-background px-3.5 py-2.5 overflow-hidden">
          <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary animate-pulse" />
          <div className="min-w-0 overflow-hidden">
            <div
              key={`${phase}-${tickerIndex}`}
              className="animate-[fadeSlideIn_0.4s_ease-out]"
            >
              <div className="text-xs font-medium text-foreground truncate">{currentStep.label}</div>
              <div className="text-[11px] text-text-tertiary truncate">{currentStep.detail}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// === Session persistence (survives navigation, clears on tab close) ===

const SESSION_KEY = 'sentinel-scan-session'

function saveSession(session: ScanSession | null) {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

function restoreSession(): ScanSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// === LiveScan Page ===

export default function LiveScan() {
  const { state, loadScanData } = useAppState()
  const navigate = useNavigate()

  // Scan state — restored from sessionStorage on mount
  const [domainInput, setDomainInput] = useState('')
  const [session, setSession] = useState<ScanSession | null>(() => restoreSession())
  const [isScanning, setIsScanning] = useState(false)
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle')
  const [probeCount, setProbeCount] = useState(0)
  const [resolvedCount, setResolvedCount] = useState(0)
  const [enrichedCount, setEnrichedCount] = useState(0)
  const [enrichTotal, setEnrichTotal] = useState(0)
  const [totalVariants, setTotalVariants] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  // Table state
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({ riskLevel: '', method: '' })
  const [sort, setSort] = useState<SortState>({ key: 'riskScore', direction: 'desc' })
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modal state
  const [showConfirm, setShowConfirm] = useState(false)

  // Persist session to sessionStorage on changes
  const [pushed, setPushed] = useState(false)
  useEffect(() => {
    if (!isScanning) saveSession(session)
  }, [session, isScanning])

  // Input validation
  const [inputError, setInputError] = useState('')

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters])

  function validateDomain(domain: string): boolean {
    const cleaned = domain.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim()
    if (!cleaned.includes('.')) {
      setInputError('Enter a valid domain (e.g., nike.com)')
      return false
    }
    if (/\s/.test(cleaned)) {
      setInputError('Domain cannot contain spaces')
      return false
    }
    setInputError('')
    return true
  }

  const handleScan = useCallback(async (overrideDomain?: string) => {
    const raw = overrideDomain ?? domainInput
    const cleaned = raw.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim().toLowerCase()
    if (!validateDomain(cleaned)) return

    // Abort any in-progress scan
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsScanning(true)
    setScanPhase('generating')
    setProbeCount(0)
    setResolvedCount(0)
    setEnrichedCount(0)
    setEnrichTotal(0)
    setSelectedResultId(null)
    setSearch('')
    setFilters({ riskLevel: '', method: '' })
    setCurrentPage(1)
    setPushed(false)

    // Generate variants
    const variants = generateVariants(cleaned)
    setTotalVariants(variants.length)

    // Initialize session with pending results
    const pendingResults: ScanResult[] = variants.map((v) => ({
      id: `SR-${v.domain.replace(/[^a-z0-9]/gi, '-')}`,
      domain: v.domain,
      brandDomain: cleaned,
      similarity: 0,
      signals: [],
      riskScore: 0,
      riskLevel: 'Low' as const,
      recommendedAction: '',
      analystSummary: '',
      generationMethod: v.method,
      enrichmentStatus: 'pending' as const,
    }))

    const newSession: ScanSession = {
      brandDomain: cleaned,
      startedAt: new Date().toISOString(),
      completedAt: null,
      phase: 'probing',
      resolvedCount: 0,
      results: pendingResults,
      stats: { totalGenerated: variants.length, totalEnriched: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 },
    }
    setSession(newSession)

    try {
      // Phase 1: DNS probe — fast check which variants actually resolve
      setScanPhase('probing')
      const dnsResults = await dnsProbeBatch(
        variants,
        (index, resolved) => {
          setProbeCount(index + 1)
          if (resolved) setResolvedCount((prev) => prev + 1)
        },
        controller.signal,
      )

      if (controller.signal.aborted) return

      // Phase 2: Full enrichment on resolved domains, local-only for rest
      const resolvedTotal = dnsResults.size
      setResolvedCount(resolvedTotal)
      setEnrichTotal(resolvedTotal)

      if (resolvedTotal > 0) {
        setScanPhase('enriching')
      }

      const allResults = await enrichResolvedBatch(
        variants,
        cleaned,
        dnsResults,
        (result, index) => {
          setEnrichedCount((prev) => {
            // Only count resolved domains in the enrichment progress
            const isResolved = dnsResults.has(result.domain)
            return isResolved ? prev + 1 : prev
          })
          setSession((prev) => {
            if (!prev) return prev
            const updated = [...prev.results]
            const idx = updated.findIndex((r) => r.domain === result.domain)
            if (idx !== -1) updated[idx] = result
            return { ...prev, results: updated }
          })
          // Suppress unused variable — index is required by callback signature
          void index
        },
        controller.signal,
      )

      if (!controller.signal.aborted) {
        setScanPhase('complete')
        const stats = {
          totalGenerated: variants.length,
          totalEnriched: allResults.length,
          highRisk: allResults.filter((r) => r.riskLevel === 'High').length,
          mediumRisk: allResults.filter((r) => r.riskLevel === 'Medium').length,
          lowRisk: allResults.filter((r) => r.riskLevel === 'Low').length,
        }
        setSession((prev) => prev ? {
          ...prev,
          completedAt: new Date().toISOString(),
          phase: 'complete',
          resolvedCount: resolvedTotal,
          stats,
        } : prev)
      }
    } catch {
      // Aborted or error — session keeps whatever was enriched
    } finally {
      setIsScanning(false)
      setScanPhase('complete')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainInput])

  function handlePushToSentinel() {
    if (!session) return
    const completedResults = session.results.filter((r) => r.enrichmentStatus === 'complete')
    const newState = buildAppStateFromScan(completedResults, state.vendors, {
      scanMeta: {
        brandDomain: session.brandDomain,
        scannedAt: session.startedAt,
        totalProbed: session.stats.totalGenerated,
        totalResolved: session.resolvedCount,
      },
    })
    loadScanData(newState)
    setShowConfirm(false)
    setPushed(true)
  }

  function handleLoadSampleData() {
    const sampleSession: ScanSession = {
      brandDomain: SAMPLE_BRAND,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      phase: 'complete',
      resolvedCount: SAMPLE_TOTAL_RESOLVED,
      results: sampleScanResults,
      stats: {
        totalGenerated: SAMPLE_TOTAL_PROBED,
        totalEnriched: sampleScanResults.length,
        highRisk: sampleScanResults.filter((r) => r.riskLevel === 'High').length,
        mediumRisk: sampleScanResults.filter((r) => r.riskLevel === 'Medium').length,
        lowRisk: sampleScanResults.filter((r) => r.riskLevel === 'Low').length,
      },
    }
    setSession(sampleSession)
    const newState = buildAppStateFromScan(sampleScanResults, state.vendors, {
      scanMeta: {
        brandDomain: SAMPLE_BRAND,
        scannedAt: new Date().toISOString(),
        totalProbed: SAMPLE_TOTAL_PROBED,
        totalResolved: SAMPLE_TOTAL_RESOLVED,
      },
    })
    loadScanData(newState)
    setPushed(true)
  }

  // Filter + sort + paginate results
  const filteredResults = useMemo(() => {
    if (!session) return []
    let result = session.results

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((r) => r.domain.toLowerCase().includes(q))
    }
    if (filters.riskLevel) result = result.filter((r) => r.riskLevel === filters.riskLevel)
    if (filters.method) result = result.filter((r) => r.generationMethod === filters.method)

    return sortResults(result, sort)
  }, [session, search, filters, sort])

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredResults.slice(start, start + pageSize)
  }, [filteredResults, currentPage, pageSize])

  const selectedResult = selectedResultId
    ? session?.results.find((r) => r.id === selectedResultId) ?? null
    : null

  const scanComplete = session && !isScanning
  const hasResults = session && session.results.length > 0

  // Live stats computed from results (updates during scanning)
  const liveStats = useMemo(() => {
    if (!session) return { totalEnriched: 0, highRisk: 0, mediumRisk: 0 }
    const completed = session.results.filter((r) => r.enrichmentStatus === 'complete')
    return {
      totalEnriched: completed.length,
      highRisk: completed.filter((r) => r.riskLevel === 'High').length,
      mediumRisk: completed.filter((r) => r.riskLevel === 'Medium').length,
    }
  }, [session])

  return (
    <div className="relative">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Live Scan</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Generate and enrich suspicious domain variants
          </p>
        </div>

        {/* Scan Form */}
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1">
              <label htmlFor="brand-domain" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Brand Domain
              </label>
              <div className="relative">
                <input
                  id="brand-domain"
                  type="text"
                  value={domainInput}
                  onChange={(e) => { setDomainInput(e.target.value); setInputError('') }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !isScanning) handleScan() }}
                  placeholder="e.g., nike.com, bankofamerica.com"
                  className={`h-10 w-full rounded-lg border bg-background px-4 text-sm text-foreground placeholder:text-text-tertiary outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus:border-primary focus:ring-1 focus:ring-primary ${inputError ? 'border-destructive' : 'border-border'}`}
                />
              </div>
              {inputError && <p className="mt-1.5 text-xs text-destructive">{inputError}</p>}
            </div>
            <Button
              onClick={() => handleScan()}
              disabled={isScanning || !domainInput.trim()}
              className="h-10 w-full sm:w-auto px-6"
            >
              {isScanning ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Radar className="size-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
          {/* Suggested targets */}
          {!isScanning && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Popular targets:</span>
              {SUGGESTED_TARGETS.map((t) => (
                <button
                  key={t.domain}
                  onClick={() => setDomainInput(t.domain)}
                  className="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs text-text-secondary hover:border-primary hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          {isScanning && (
            <ScanProgress
              phase={scanPhase}
              probeCount={probeCount}
              totalVariants={totalVariants}
              resolvedCount={resolvedCount}
              enrichedCount={enrichedCount}
              enrichTotal={enrichTotal}
            />
          )}
        </div>

        {/* Summary Strip */}
        {hasResults && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Domains Checked"
              value={liveStats.totalEnriched}
              icon={Target}
            />
            <StatCard
              label="Suspicious Found"
              value={liveStats.highRisk + liveStats.mediumRisk}
              icon={Activity}
              highlight
            />
            <StatCard
              label="High Risk"
              value={liveStats.highRisk}
              icon={AlertTriangle}
            />
            <StatCard
              label="Medium Risk"
              value={liveStats.mediumRisk}
              icon={Shield}
            />
          </div>
        )}

        {/* Action Bar */}
        {scanComplete && hasResults && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {pushed ? (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-muted px-4 py-2">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="text-sm font-medium text-success">Pushed to Sentinel</span>
                </div>
                <Button
                  variant="outline"
                  className="h-9 px-5 w-full sm:w-auto"
                  onClick={() => navigate('/')}
                >
                  Go to Dashboard
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  onClick={() => setShowConfirm(true)}
                  className="h-10 sm:h-9 px-5 w-full sm:w-auto"
                  disabled={liveStats.highRisk + liveStats.mediumRisk === 0}
                >
                  <Zap className="size-4 mr-2" />
                  Push to Sentinel
                </Button>
                <span className="text-xs text-muted-foreground">
                  {liveStats.highRisk + liveStats.mediumRisk} actionable results will be pushed
                </span>
              </div>
            )}
            <Button
              variant="outline"
              className="h-10 sm:h-9 px-5 w-full sm:w-auto"
              onClick={() => exportCsv(session.results.filter((r) => r.enrichmentStatus === 'complete'))}
            >
              <Download className="size-4 mr-2" />
              Export CSV
            </Button>
          </div>
        )}

        {/* Filters + Table */}
        {hasResults && (
          <>
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search domains..."
              filters={filterDefs}
              activeFilters={filters}
              onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            />

            <DataTable
              columns={columns}
              data={paginatedResults}
              sort={sort}
              onSortChange={setSort}
              selectedId={selectedResultId}
              onRowClick={(r) => setSelectedResultId(r.id === selectedResultId ? null : r.id)}
              getRowId={(r) => r.id}
              emptyMessage="No results match your filters."
              pagination={{
                currentPage,
                pageSize,
                totalItems: filteredResults.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            />
          </>
        )}

        {/* Empty state */}
        {!hasResults && !isScanning && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-alt mb-4">
              <Radar className="size-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">Enter a brand domain to begin scanning</h2>
            <p className="text-sm text-text-secondary max-w-md">
              The scanner generates suspicious domain variants, probes DNS to find active ones, then enriches with registration, certificate, and threat intelligence data. Try a major brand — financial institutions and tech companies attract the most typosquatting activity.
            </p>
            <button
              onClick={handleLoadSampleData}
              className="mt-6 text-xs text-text-tertiary hover:text-primary transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] underline underline-offset-2"
            >
              Or load sample data to explore the workflow →
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedResult && (
        <DetailPanel
          open
          onClose={() => setSelectedResultId(null)}
          title={selectedResult.domain}
          subtitle={`${selectedResult.generationMethod} — ${selectedResult.riskLevel} risk`}
        >
          <ScanResultDetail result={selectedResult} />
        </DetailPanel>
      )}

      {/* Confirmation modal */}
      <ConfirmModal
        open={showConfirm}
        onConfirm={handlePushToSentinel}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
