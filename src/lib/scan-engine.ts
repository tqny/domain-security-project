import type { GenerationMethod, RiskLevel, ScanResult, ScanSignal } from '@/types/scan'

// === Domain Variant Generation ===

interface VariantCandidate {
  domain: string
  method: GenerationMethod
}

const COMMON_TLDS = ['.net', '.org', '.info', '.co', '.xyz', '.site', '.online', '.app', '.io', '.biz', '.us']

const SUSPICIOUS_KEYWORDS = [
  'login', 'secure', 'verify', 'support', 'account',
  'update', 'confirm', 'auth', 'banking', 'service',
]

// Adjacent keys on QWERTY keyboard for typo simulation
const ADJACENT_KEYS: Record<string, string[]> = {
  a: ['s', 'q', 'z'], b: ['v', 'n', 'g', 'h'], c: ['x', 'v', 'd', 'f'],
  d: ['s', 'f', 'e', 'c'], e: ['w', 'r', 'd', 's'], f: ['d', 'g', 'r', 'v'],
  g: ['f', 'h', 't', 'b'], h: ['g', 'j', 'y', 'n'], i: ['u', 'o', 'k', 'j'],
  j: ['h', 'k', 'u', 'n'], k: ['j', 'l', 'i', 'm'], l: ['k', 'o', 'p'],
  m: ['n', 'k', 'l'], n: ['b', 'm', 'h', 'j'], o: ['i', 'p', 'l', 'k'],
  p: ['o', 'l'], q: ['w', 'a'], r: ['e', 't', 'f', 'd'],
  s: ['a', 'd', 'w', 'z'], t: ['r', 'y', 'g', 'f'], u: ['y', 'i', 'j', 'h'],
  v: ['c', 'b', 'f', 'g'], w: ['q', 'e', 's', 'a'], x: ['z', 'c', 's', 'd'],
  y: ['t', 'u', 'h', 'g'], z: ['a', 'x', 's'],
}

// Visually similar character substitutions
const HOMOGLYPHS: Record<string, string[]> = {
  a: ['à', 'á', 'ä', 'ã', 'å', 'ɑ'],
  c: ['ç', 'ć'],
  e: ['è', 'é', 'ë', 'ê', 'ɛ'],
  g: ['ɡ'],
  i: ['í', 'ì', 'ï', 'î', '1', 'l'],
  l: ['1', 'i', 'ℓ'],
  n: ['ñ', 'ń'],
  o: ['0', 'ó', 'ò', 'ö', 'ô', 'ø'],
  r: ['ŕ'],
  s: ['ś', 'ş', '5'],
  u: ['ú', 'ù', 'ü', 'û'],
}

// Common character substitutions (non-homoglyph)
const CHAR_SUBS: Record<string, string[]> = {
  a: ['4', '@'], e: ['3'], g: ['9'], i: ['1', '!'], l: ['1'],
  o: ['0'], s: ['5', '$'], t: ['7'], b: ['6'], z: ['2'],
}

function parseDomain(fullDomain: string): { name: string; tld: string } {
  const cleaned = fullDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').trim()
  const lastDot = cleaned.lastIndexOf('.')
  if (lastDot === -1) return { name: cleaned, tld: '.com' }
  return { name: cleaned.substring(0, lastDot), tld: cleaned.substring(lastDot) }
}

function charSubstitutions(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  for (let i = 0; i < name.length && results.length < 8; i++) {
    const ch = name[i]
    const subs = CHAR_SUBS[ch]
    if (subs) {
      for (const sub of subs.slice(0, 1)) {
        results.push({
          domain: name.substring(0, i) + sub + name.substring(i + 1) + tld,
          method: 'char-substitution',
        })
      }
    }
  }
  return results
}

function charInsertions(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  // Double letter insertions
  for (let i = 0; i < name.length && results.length < 4; i++) {
    const ch = name[i]
    if (/[a-z]/.test(ch)) {
      results.push({
        domain: name.substring(0, i) + ch + name.substring(i) + tld,
        method: 'char-insertion',
      })
    }
  }
  // Adjacent key insertions
  for (let i = 0; i < name.length && results.length < 6; i++) {
    const ch = name[i]
    const adj = ADJACENT_KEYS[ch]
    if (adj) {
      results.push({
        domain: name.substring(0, i + 1) + adj[0] + name.substring(i + 1) + tld,
        method: 'char-insertion',
      })
    }
  }
  return results.slice(0, 6)
}

function charDeletions(name: string, tld: string): VariantCandidate[] {
  if (name.length <= 2) return []
  const results: VariantCandidate[] = []
  for (let i = 0; i < name.length && results.length < 4; i++) {
    results.push({
      domain: name.substring(0, i) + name.substring(i + 1) + tld,
      method: 'char-deletion',
    })
  }
  return results
}

function charTranspositions(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  for (let i = 0; i < name.length - 1 && results.length < 5; i++) {
    if (name[i] !== name[i + 1]) {
      const arr = name.split('')
      ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      results.push({ domain: arr.join('') + tld, method: 'char-transposition' })
    }
  }
  return results
}

function homoglyphVariants(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  for (let i = 0; i < name.length && results.length < 12; i++) {
    const ch = name[i]
    const glyphs = HOMOGLYPHS[ch]
    if (glyphs) {
      results.push({
        domain: name.substring(0, i) + glyphs[0] + name.substring(i + 1) + tld,
        method: 'homoglyph',
      })
    }
  }
  return results
}

function keywordVariants(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  const keywords = SUSPICIOUS_KEYWORDS.slice(0, 8)
  for (const kw of keywords) {
    results.push(
      { domain: `${kw}-${name}${tld}`, method: 'keyword' },
      { domain: `${name}-${kw}${tld}`, method: 'keyword' },
    )
  }
  return results.slice(0, 14)
}

function tldVariations(name: string): VariantCandidate[] {
  return COMMON_TLDS.slice(0, 9).map((tld) => ({
    domain: name + tld,
    method: 'tld-variation' as GenerationMethod,
  }))
}

function hyphenationVariants(name: string, tld: string): VariantCandidate[] {
  const results: VariantCandidate[] = []
  // Insert hyphens at natural word boundaries (every 3-5 chars)
  for (let i = 3; i < name.length - 1 && results.length < 4; i += 3) {
    if (name[i] !== '-' && name[i - 1] !== '-') {
      results.push({
        domain: name.substring(0, i) + '-' + name.substring(i) + tld,
        method: 'hyphenation',
      })
    }
  }
  // Remove existing hyphens
  if (name.includes('-')) {
    results.push({
      domain: name.replace(/-/g, '') + tld,
      method: 'hyphenation',
    })
  }
  return results
}

/**
 * Generate suspicious domain variants for a given brand domain.
 * Applies 8 generation techniques, deduplicates, caps at ~80 results.
 */
export function generateVariants(brandDomain: string): VariantCandidate[] {
  const { name, tld } = parseDomain(brandDomain)
  const original = name + tld

  const allVariants = [
    ...charSubstitutions(name, tld),
    ...charInsertions(name, tld),
    ...charDeletions(name, tld),
    ...charTranspositions(name, tld),
    ...homoglyphVariants(name, tld),
    ...keywordVariants(name, tld),
    ...tldVariations(name),
    ...hyphenationVariants(name, tld),
  ]

  // Deduplicate and remove the original domain
  const seen = new Set<string>([original])
  const unique: VariantCandidate[] = []
  for (const v of allVariants) {
    const key = v.domain.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(v)
    }
  }

  return unique.slice(0, 80)
}

// === Similarity ===

/**
 * Levenshtein distance-based normalized similarity (0 = no match, 1 = identical).
 */
export function computeSimilarity(a: string, b: string): number {
  const la = a.length
  const lb = b.length
  if (la === 0 && lb === 0) return 1
  if (la === 0 || lb === 0) return 0

  const matrix: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0))
  for (let i = 0; i <= la; i++) matrix[i][0] = i
  for (let j = 0; j <= lb; j++) matrix[0][j] = j

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  const maxLen = Math.max(la, lb)
  return 1 - matrix[la][lb] / maxLen
}

// === Scoring ===

const CREDENTIAL_KEYWORDS = ['login', 'signin', 'auth', 'verify', 'secure', 'account', 'password', 'banking']
const SUPPORT_KEYWORDS = ['support', 'help', 'service', 'customer', 'contact']

/**
 * Compute risk score (0-100) from similarity and enrichment signals.
 */
export function computeRiskScore(similarity: number, signals: ScanSignal[]): number {
  let score = 0

  // High similarity to brand (+25)
  if (similarity >= 0.8) score += 25
  else if (similarity >= 0.6) score += 15

  // Sum signal contributions
  for (const s of signals) {
    score += s.scoreContribution
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Classify risk level from score.
 */
export function classifyRisk(score: number): RiskLevel {
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}

/**
 * Get recommended action for a risk level.
 */
export function getRecommendedAction(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'High':
      return 'Investigate for impersonation/phishing and prepare registrar/platform escalation'
    case 'Medium':
      return 'Collect evidence and review manually'
    case 'Low':
      return 'Monitor'
  }
}

// === Analyst Summary ===

/**
 * Build a plain-English analyst explanation from scan result signals.
 */
export function generateAnalystSummary(result: ScanResult): string {
  const reasons: string[] = []
  const domainBase = result.domain.split('.')[0]

  if (result.similarity >= 0.8) {
    reasons.push('is a close typo of the legitimate brand')
  } else if (result.similarity >= 0.6) {
    reasons.push('is moderately similar to the legitimate brand')
  }

  if (result.generationMethod === 'homoglyph') {
    reasons.push('uses visually deceptive characters (homoglyph)')
  }

  const hasCredentialKeyword = CREDENTIAL_KEYWORDS.some((kw) => domainBase.includes(kw))
  const hasSupportKeyword = SUPPORT_KEYWORDS.some((kw) => domainBase.includes(kw))
  if (hasCredentialKeyword) {
    reasons.push('contains a credential-themed keyword')
  } else if (hasSupportKeyword) {
    reasons.push('contains a support/service-themed keyword')
  }

  const dnsSignal = result.signals.find((s) => s.type === 'dns')
  if (dnsSignal) {
    reasons.push('resolves to an active site')
  }

  const certSignal = result.signals.find((s) => s.type === 'cert')
  if (certSignal) {
    reasons.push('has an observed SSL certificate')
  }

  const rdapSignal = result.signals.find((s) => s.type === 'rdap')
  if (rdapSignal && rdapSignal.value.includes('recent')) {
    reasons.push('was recently registered')
  }

  if (result.signals.find((s) => s.type === 'urlhaus')) {
    reasons.push('is flagged as a known malicious host by URLhaus (abuse.ch)')
  }

  if (result.signals.find((s) => s.type === 'otx')) {
    reasons.push('has been reported in community threat intelligence (AlienVault OTX)')
  }

  if (result.signals.find((s) => s.type === 'spamhaus')) {
    reasons.push('is listed on the Spamhaus Domain Blocklist')
  }

  if (reasons.length === 0) {
    return `This domain (${result.domain}) has a low threat profile based on available signals.`
  }

  const riskWord = result.riskLevel === 'High' ? 'high risk' : result.riskLevel === 'Medium' ? 'moderate risk' : 'low risk'
  const joined =
    reasons.length === 1
      ? reasons[0]
      : reasons.slice(0, -1).join(', ') + ', and ' + reasons[reasons.length - 1]

  return `This domain is ${riskWord} because it ${joined}.`
}

// === Local Signal Builders ===

/**
 * Build local (non-API) signals: keyword detection, homoglyph flag, similarity.
 */
export function buildLocalSignals(
  domain: string,
  brandDomain: string,
  method: GenerationMethod,
  similarity: number,
): ScanSignal[] {
  const signals: ScanSignal[] = []
  const domainBase = domain.split('.')[0].toLowerCase()

  // Similarity signal (informational, score handled separately in computeRiskScore)
  signals.push({
    type: 'similarity',
    label: 'String similarity',
    value: `${Math.round(similarity * 100)}% similar to ${brandDomain}`,
    scoreContribution: 0, // scored separately
  })

  // Keyword detection — credential keywords score higher than general suspicious keywords
  const credentialKeyword = CREDENTIAL_KEYWORDS.find((kw) => domainBase.includes(kw))
  const supportKeyword = SUPPORT_KEYWORDS.find((kw) => domainBase.includes(kw))

  if (credentialKeyword) {
    signals.push({
      type: 'keyword',
      label: 'Credential-themed keyword',
      value: `Contains "${credentialKeyword}" — suggests login or verification page`,
      scoreContribution: 20,
    })
  } else if (supportKeyword) {
    signals.push({
      type: 'keyword',
      label: 'Suspicious keyword',
      value: `Contains "${supportKeyword}"`,
      scoreContribution: 20,
    })
  }

  // Homoglyph
  if (method === 'homoglyph') {
    signals.push({
      type: 'homoglyph',
      label: 'Homoglyph / punycode',
      value: 'Uses visually deceptive characters',
      scoreContribution: 25,
    })
  }

  return signals
}
