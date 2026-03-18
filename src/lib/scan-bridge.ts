import type { ScanResult } from '@/types/scan'
import type {
  AppState,
  Case,
  Domain,
  Evidence,
  EnforcementAction,
  Vendor,
  CaseStatus,
  Priority,
  ThreatType,
  DomainStatus,
  ActionType,
  ActionStatus,
  EvidenceType,
} from '@/types'

// === Status Distribution ===

const CASE_STATUS_DISTRIBUTION: { status: CaseStatus; weight: number }[] = [
  { status: 'New', weight: 0.2 },
  { status: 'Triaged', weight: 0.25 },
  { status: 'Investigating', weight: 0.25 },
  { status: 'Enforcement', weight: 0.2 },
  { status: 'Closed', weight: 0.1 },
]

const ACTION_STATUS_POOL: ActionStatus[] = ['Queued', 'Sent', 'In Progress']
const ACTION_TYPE_POOL: ActionType[] = ['Takedown Notice', 'Registrar Report']
const OWNERS = ['Sarah Chen', 'Marcus Johnson', 'Alex Rivera', 'Jordan Kim']

function pickStatus(index: number, total: number): CaseStatus {
  const position = index / total
  let cumulative = 0
  for (const { status, weight } of CASE_STATUS_DISTRIBUTION) {
    cumulative += weight
    if (position < cumulative) return status
  }
  return 'Closed'
}

function pickPriority(riskScore: number): Priority {
  if (riskScore >= 70) return 'Critical'
  if (riskScore >= 60) return 'High'
  if (riskScore >= 40) return 'Medium'
  return 'Low'
}

function inferThreatType(result: ScanResult): ThreatType {
  const domain = result.domain.toLowerCase()
  const hasCredentialKeyword = ['login', 'signin', 'auth', 'verify', 'secure', 'password', 'banking'].some(
    (kw) => domain.includes(kw),
  )
  if (hasCredentialKeyword) return 'Phishing'
  if (result.generationMethod === 'homoglyph') return 'Phishing'
  if (['support', 'help', 'service', 'customer'].some((kw) => domain.includes(kw))) return 'Impersonation'
  if (result.riskScore >= 60) return 'Impersonation'
  return 'Scam'
}

function inferDomainStatus(result: ScanResult): DomainStatus {
  if (result.riskLevel === 'High') return 'Incident'
  if (result.riskLevel === 'Medium') return 'Monitoring'
  return 'Active'
}

/** Generate a staggered date within the past N days */
function staggeredDate(index: number, total: number, daysSpan: number): string {
  const now = Date.now()
  const span = daysSpan * 24 * 60 * 60 * 1000
  const offset = (index / Math.max(total - 1, 1)) * span
  return new Date(now - span + offset).toISOString()
}

// === Bridge ===

/**
 * Map scan results into a complete AppState for the BPCC workflow.
 * Only High and Medium risk results create entities.
 * Cases are distributed across workflow statuses to populate the pipeline.
 */
export function buildAppStateFromScan(results: ScanResult[], vendors: Vendor[]): AppState {
  const actionable = results.filter((r) => r.riskLevel === 'High' || r.riskLevel === 'Medium')

  // Sort: High risk first, then by score descending
  actionable.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'High' ? -1 : 1
    return b.riskScore - a.riskScore
  })

  const cases: Case[] = []
  const domains: Domain[] = []
  const evidence: Evidence[] = []
  const enforcementActions: EnforcementAction[] = []

  let evidenceCounter = 1
  let enforcementCounter = 1

  for (let i = 0; i < actionable.length; i++) {
    const result = actionable[i]
    const domainId = `DOM-S${String(i + 1).padStart(3, '0')}`
    const caseId = `BG-S${String(i + 1).padStart(3, '0')}`
    const status = pickStatus(i, actionable.length)
    const createdAt = staggeredDate(i, actionable.length, 14)
    const now = new Date().toISOString()

    // Extract registrar from RDAP signal if available
    const rdapSignal = result.signals.find((s) => s.type === 'rdap')
    const rdapRaw = rdapSignal?.raw as { registrar?: string; expirationDate?: string; isRecent?: boolean } | undefined
    const registrar = rdapRaw?.registrar ?? 'Unknown'
    const expiresOn = rdapRaw?.expirationDate
      ? new Date(rdapRaw.expirationDate).toISOString().split('T')[0]
      : '2027-01-01'

    // Build risk flags from signals
    const riskFlags: string[] = []
    if (result.signals.find((s) => s.type === 'dns')) riskFlags.push('Active DNS resolution')
    if (result.signals.find((s) => s.type === 'cert')) riskFlags.push('SSL certificate detected')
    if (rdapRaw?.isRecent) riskFlags.push('Recently registered')
    if (result.generationMethod === 'homoglyph') riskFlags.push('Homoglyph / deceptive characters')
    if (result.signals.find((s) => s.type === 'keyword')) riskFlags.push('Suspicious keyword in domain')
    if (result.signals.find((s) => s.type === 'urlhaus')) riskFlags.push('Known malicious (URLhaus)')
    if (result.signals.find((s) => s.type === 'otx')) riskFlags.push('Community threat reports (OTX)')
    if (result.signals.find((s) => s.type === 'spamhaus')) riskFlags.push('Spamhaus blocklisted')

    // --- Domain ---
    domains.push({
      id: domainId,
      domainName: result.domain,
      registrar,
      status: inferDomainStatus(result),
      expiresOn,
      dnsSecurity: { dnssec: false, registryLock: false, whoisPrivacy: false },
      riskFlags,
      notes: result.analystSummary,
      actionLog: [
        {
          id: `LOG-S${String(i + 1).padStart(3, '0')}`,
          action: 'Detected via Live Scan',
          performedBy: 'System',
          performedAt: createdAt,
        },
      ],
      lastFlaggedAt: createdAt,
    })

    // --- Case ---
    const threatType = inferThreatType(result)
    const isAssigned = status !== 'New'
    const owner = isAssigned ? OWNERS[i % OWNERS.length] : ''

    // Generate AI summary for the case
    const aiSummary = `Automated analysis detected ${result.domain} as a potential ${threatType.toLowerCase()} threat targeting ${result.brandDomain}. ${result.analystSummary} Risk score: ${result.riskScore}/100.`
    const aiSuggestedAction = result.recommendedAction

    cases.push({
      id: caseId,
      title: `Suspicious ${result.generationMethod}: ${result.domain}`,
      channel: 'Domain',
      threatType,
      riskScore: result.riskScore,
      priority: pickPriority(result.riskScore),
      status,
      owner,
      summary: `Live scan detected suspicious domain variant ${result.domain} (${result.generationMethod}) targeting ${result.brandDomain}. ${riskFlags.join('. ')}.`,
      aiSummary,
      aiSuggestedAction,
      createdAt,
      updatedAt: now,
      triagedAt: ['Triaged', 'Investigating', 'Enforcement', 'Closed'].includes(status) ? createdAt : null,
      closedAt: status === 'Closed' ? now : null,
      linkedDomainId: domainId,
      notes: [],
    })

    // --- Evidence (one per enrichment signal) ---
    for (const signal of result.signals) {
      let evidenceType: EvidenceType
      switch (signal.type) {
        case 'dns': evidenceType = 'dns_record'; break
        case 'rdap': evidenceType = 'whois_snapshot'; break
        case 'cert': evidenceType = 'cert_log'; break
        case 'urlhaus': case 'otx': case 'spamhaus': evidenceType = 'threat_intel'; break
        default: evidenceType = 'text_snippet'; break
      }

      evidence.push({
        id: `EV-S${String(evidenceCounter++).padStart(3, '0')}`,
        caseId,
        type: evidenceType,
        value: `${signal.label}: ${signal.value}`,
        capturedAt: createdAt,
      })
    }

    // --- Enforcement Actions (for ~40% of Investigating/Enforcement cases) ---
    if (
      (status === 'Investigating' || status === 'Enforcement') &&
      i % 3 !== 2 && // roughly 66% of eligible = ~40% of total
      vendors.length > 0
    ) {
      const vendor = vendors[i % vendors.length]
      const actionStatus = ACTION_STATUS_POOL[i % ACTION_STATUS_POOL.length]
      const actionType = ACTION_TYPE_POOL[i % ACTION_TYPE_POOL.length]
      const requestedAt = createdAt
      const dueAt = new Date(
        new Date(requestedAt).getTime() + vendor.slaHours * 3600000,
      ).toISOString()

      enforcementActions.push({
        id: `EA-S${String(enforcementCounter++).padStart(3, '0')}`,
        caseId,
        vendorId: vendor.id,
        actionType,
        status: actionStatus,
        requestedAt,
        dueAt,
        resolvedAt: null,
        outcome: null,
        notes: [],
      })
    }
  }

  return { cases, domains, evidence, vendors, enforcementActions }
}
