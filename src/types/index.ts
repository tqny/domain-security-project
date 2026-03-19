// === Enums ===

export type Channel = 'Domain' | 'Marketplace' | 'Paid Search' | 'App' | 'Social'

export type ThreatType = 'Impersonation' | 'Phishing' | 'Counterfeit' | 'Scam' | 'Policy Abuse'

export type CaseStatus = 'New' | 'Triaged' | 'Investigating' | 'Enforcement' | 'Closed'

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export type DomainStatus = 'Active' | 'Monitoring' | 'Incident' | 'Suspended'

export type ActionType =
  | 'Takedown Notice'
  | 'Registrar Report'
  | 'Paid Search Complaint'
  | 'Marketplace Report'
  | 'Legal Escalation'

export type ActionStatus = 'Queued' | 'Sent' | 'In Progress' | 'Resolved' | 'Denied'

export type EvidenceType =
  | 'text_snippet'
  | 'screenshot'
  | 'url'
  | 'dns_record'
  | 'whois_snapshot'
  | 'cert_log'
  | 'threat_intel'

// === Entities ===

export interface CaseNote {
  id: string
  text: string
  author: string
  createdAt: string
}

export type TriageStatus = 'pending' | 'agreed' | 'manual-review'

export interface Case {
  id: string
  title: string
  channel: Channel
  threatType: ThreatType
  riskScore: number // 0–100
  priority: Priority
  status: CaseStatus
  owner: string
  summary: string
  aiSummary: string
  aiSuggestedAction: string
  createdAt: string
  updatedAt: string
  triagedAt: string | null
  closedAt: string | null
  linkedDomainId: string | null
  notes: CaseNote[]
  triageStatus?: TriageStatus
}

export interface Evidence {
  id: string
  caseId: string
  type: EvidenceType
  value: string
  capturedAt: string
}

export interface DnsSecurity {
  dnssec: boolean
  registryLock: boolean
  whoisPrivacy: boolean
}

export interface DomainActionLog {
  id: string
  action: string
  performedBy: string
  performedAt: string
}

export interface Domain {
  id: string
  domainName: string
  registrar: string
  status: DomainStatus
  expiresOn: string
  dnsSecurity: DnsSecurity
  riskFlags: string[]
  notes: string
  actionLog: DomainActionLog[]
  lastFlaggedAt: string | null
}

export interface Vendor {
  id: string
  name: string
  slaHours: 24 | 36 | 48
  region: string
  notes: string
}

export interface EnforcementNote {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface EnforcementAction {
  id: string
  caseId: string
  vendorId: string
  actionType: ActionType
  status: ActionStatus
  requestedAt: string
  dueAt: string
  resolvedAt: string | null
  outcome: string | null
  notes: EnforcementNote[]
}

// === App State ===

export interface ScanMeta {
  brandDomain: string
  scannedAt: string
  totalProbed: number
  totalResolved: number
  totalActionable: number
}

export interface AppState {
  cases: Case[]
  evidence: Evidence[]
  domains: Domain[]
  vendors: Vendor[]
  enforcementActions: EnforcementAction[]
  scanMeta?: ScanMeta
}

// === AI Insights (DATA phase ready) ===

export interface AIInsight {
  id: string
  severity: 'critical' | 'warning' | 'info'
  summary: string
  suggestedAction: string
  actionLabel: string
  caseId?: string
}
