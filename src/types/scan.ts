// === Live Scan types (session-only, not persisted) ===

export type RiskLevel = 'Low' | 'Medium' | 'High'

export type GenerationMethod =
  | 'char-substitution'
  | 'char-insertion'
  | 'char-deletion'
  | 'char-transposition'
  | 'homoglyph'
  | 'keyword'
  | 'tld-variation'
  | 'hyphenation'

export type SignalType = 'dns' | 'rdap' | 'cert' | 'keyword' | 'similarity' | 'homoglyph' | 'urlhaus' | 'otx' | 'spamhaus'

export interface ScanSignal {
  type: SignalType
  label: string
  value: string
  scoreContribution: number
  raw?: unknown
}

export interface ScanResult {
  id: string
  domain: string
  brandDomain: string
  similarity: number
  signals: ScanSignal[]
  riskScore: number
  riskLevel: RiskLevel
  recommendedAction: string
  analystSummary: string
  generationMethod: GenerationMethod
  enrichmentStatus: 'pending' | 'enriching' | 'complete' | 'error'
}

export type ScanPhase = 'idle' | 'generating' | 'probing' | 'enriching' | 'complete'

export interface ScanSession {
  brandDomain: string
  startedAt: string
  completedAt: string | null
  phase: ScanPhase
  resolvedCount: number
  results: ScanResult[]
  stats: {
    totalGenerated: number
    totalEnriched: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
  }
}
