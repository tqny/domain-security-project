import type { ScanResult } from '@/types/scan'
import type {
  AppState,
  ScanMeta,
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
import { OWNERS } from '@/data/store'

// === Constants ===

const TIER2_STATUS_DISTRIBUTION: { status: CaseStatus; weight: number }[] = [
  { status: 'Triaged', weight: 0.35 },
  { status: 'Investigating', weight: 0.40 },
  { status: 'Enforcement', weight: 0.25 },
]

const ACTION_STATUS_POOL: ActionStatus[] = ['Queued', 'Sent', 'In Progress']
const ACTION_TYPE_POOL: ActionType[] = ['Takedown Notice', 'Registrar Report']

// === Helpers ===

function pickTier2Status(index: number, total: number): CaseStatus {
  const position = index / Math.max(total, 1)
  let cumulative = 0
  for (const { status, weight } of TIER2_STATUS_DISTRIBUTION) {
    cumulative += weight
    if (position < cumulative) return status
  }
  return 'Enforcement'
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

// === Bridge ===

interface BuildOptions {
  scanMeta?: Omit<ScanMeta, 'totalActionable'>
}

/**
 * Map scan results into a complete AppState for the BPCC workflow.
 *
 * Two-tier distribution:
 * - Top 5 highest-risk → status "New", triageStatus "pending" (await AI triage)
 * - Remaining → auto-distributed across Triaged/Investigating/Enforcement
 */
export function buildAppStateFromScan(
  results: ScanResult[],
  vendors: Vendor[],
  options?: BuildOptions,
): AppState {
  const actionable = results.filter((r) => r.riskLevel === 'High' || r.riskLevel === 'Medium')

  // Sort: High risk first, then by score descending
  actionable.sort((a, b) => {
    if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'High' ? -1 : 1
    return b.riskScore - a.riskScore
  })

  const now = new Date().toISOString()
  const top5 = actionable.slice(0, 5)
  const rest = actionable.slice(5)

  const cases: Case[] = []
  const domains: Domain[] = []
  const evidence: Evidence[] = []
  const enforcementActions: EnforcementAction[] = []

  let evidenceCounter = 1
  let enforcementCounter = 1

  function processResult(
    result: ScanResult,
    index: number,
    tier: 'top5' | 'rest',
    restIndex: number,
  ) {
    const globalIndex = tier === 'top5' ? index : index + top5.length
    const domainId = `DOM-S${String(globalIndex + 1).padStart(3, '0')}`
    const caseId = `BG-S${String(globalIndex + 1).padStart(3, '0')}`

    // Tier determines status and triage
    const status: CaseStatus = tier === 'top5'
      ? 'New'
      : pickTier2Status(restIndex, rest.length)

    const isAutoTriaged = tier === 'rest'
    const owner = isAutoTriaged ? OWNERS[restIndex % OWNERS.length] : ''

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
          id: `LOG-S${String(globalIndex + 1).padStart(3, '0')}`,
          action: 'Detected via Live Scan',
          performedBy: 'System',
          performedAt: now,
        },
      ],
      lastFlaggedAt: now,
    })

    // --- Case ---
    const threatType = inferThreatType(result)
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
      createdAt: now,
      updatedAt: now,
      triagedAt: isAutoTriaged ? now : null,
      closedAt: null,
      linkedDomainId: domainId,
      notes: [],
      triageStatus: tier === 'top5' ? 'pending' : undefined,
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
        capturedAt: now,
      })
    }

    // --- Enforcement Actions (for rest tier: Investigating/Enforcement cases) ---
    if (
      tier === 'rest' &&
      (status === 'Investigating' || status === 'Enforcement') &&
      restIndex % 3 !== 2 &&
      vendors.length > 0
    ) {
      const vendor = vendors[restIndex % vendors.length]
      const actionStatus = ACTION_STATUS_POOL[restIndex % ACTION_STATUS_POOL.length]
      const actionType = ACTION_TYPE_POOL[restIndex % ACTION_TYPE_POOL.length]
      const dueAt = new Date(
        Date.now() + vendor.slaHours * 3600000,
      ).toISOString()

      enforcementActions.push({
        id: `EA-S${String(enforcementCounter++).padStart(3, '0')}`,
        caseId,
        vendorId: vendor.id,
        actionType,
        status: actionStatus,
        requestedAt: now,
        dueAt,
        resolvedAt: null,
        outcome: null,
        notes: [],
      })
    }
  }

  // Process top 5 (triage-pending)
  top5.forEach((result, i) => processResult(result, i, 'top5', 0))

  // Process rest (auto-distributed)
  rest.forEach((result, i) => processResult(result, i, 'rest', i))

  // Build scan metadata
  const scanMeta: ScanMeta | undefined = options?.scanMeta
    ? { ...options.scanMeta, totalActionable: actionable.length }
    : undefined

  return { cases, domains, evidence, vendors, enforcementActions, scanMeta }
}
