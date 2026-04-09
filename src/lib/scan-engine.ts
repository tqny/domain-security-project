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
 * Applies 8 generation techniques, deduplicates, caps at ~40 results.
 * Prioritizes high-threat methods (homoglyphs, keywords) over low-threat ones.
 */
export function generateVariants(brandDomain: string): VariantCandidate[] {
  const { name, tld } = parseDomain(brandDomain)
  const original = name + tld

  // Generate in priority order: high-threat methods first, broad coverage
  const allVariants = [
    ...homoglyphVariants(name, tld).slice(0, 10),          // 10 homoglyphs (high threat)
    ...keywordVariants(name, tld).slice(0, 12),            // 12 keyword variants (high threat)
    ...tldVariations(name).slice(0, 7),                    // 7 TLD variations
    ...charTranspositions(name, tld).slice(0, 4),          // 4 transpositions
    ...charSubstitutions(name, tld).slice(0, 4),           // 4 substitutions
    ...charInsertions(name, tld).slice(0, 3),              // 3 insertions
    ...hyphenationVariants(name, tld).slice(0, 2),         // 2 hyphenation
    ...charDeletions(name, tld).slice(0, 2),               // 2 deletions
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

  return unique.slice(0, 40)
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
 * Includes compound bonuses for signal combinations that indicate active threats.
 */
export function computeRiskScore(similarity: number, signals: ScanSignal[]): number {
  let score = 0

  // High similarity to brand
  if (similarity >= 0.95) score += 35
  else if (similarity >= 0.9) score += 30
  else if (similarity >= 0.8) score += 25
  else if (similarity >= 0.6) score += 15

  // Sum signal contributions
  for (const s of signals) {
    score += s.scoreContribution
  }

  // Compound bonuses — signal combos that indicate active threats
  const hasDns = signals.some((s) => s.type === 'dns')
  const hasCert = signals.some((s) => s.type === 'cert')
  const hasRecentRdap = signals.some((s) => s.type === 'rdap' && (s.raw as { isRecent?: boolean })?.isRecent === true)
  const hasKeyword = signals.some((s) => s.type === 'keyword')
  const hasHomoglyph = signals.some((s) => s.type === 'homoglyph')
  const hasThreatIntel = signals.some((s) => s.type === 'urlhaus' || s.type === 'otx' || s.type === 'spamhaus')

  // Active infrastructure: DNS + cert = trying to look legitimate
  if (hasDns && hasCert) score += 15

  // Active + fresh = almost certainly malicious
  if (hasDns && hasCert && hasRecentRdap) score += 10

  // Deceptive + active = high-confidence phishing
  if (hasHomoglyph && hasDns) score += 15
  else if (hasKeyword && hasDns) score += 10

  // Threat intel hit + active = confirmed threat
  if (hasThreatIntel && hasDns) score += 10

  // High similarity + active = brand impersonation
  if (similarity >= 0.9 && hasDns && !hasKeyword && !hasHomoglyph) score += 10

  // Keyword variants that resolve and have certs are essentially phishing kits
  if (hasKeyword && hasDns && hasCert) score += 10

  return Math.min(100, Math.max(0, score))
}

/**
 * Classify risk level from score.
 */
export function classifyRisk(score: number): RiskLevel {
  if (score >= 55) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}

/**
 * Get recommended action based on risk level and signal context.
 */
export function getRecommendedAction(riskLevel: RiskLevel, signals?: ScanSignal[]): string {
  if (riskLevel === 'Low') return 'Add to monitoring watchlist. Re-assess if domain becomes active.'

  const hasDns = signals?.some((s) => s.type === 'dns')
  const hasCert = signals?.some((s) => s.type === 'cert')
  const hasRecentRdap = signals?.some((s) => s.type === 'rdap' && (s.raw as { isRecent?: boolean })?.isRecent === true)
  const hasThreatIntel = signals?.some((s) => s.type === 'urlhaus' || s.type === 'otx' || s.type === 'spamhaus')
  const hasHomoglyph = signals?.some((s) => s.type === 'homoglyph')
  const hasKeyword = signals?.some((s) => s.type === 'keyword')
  const credentialKw = signals?.find((s) => s.type === 'keyword' && s.label.includes('Credential'))

  if (riskLevel === 'High') {
    if (hasThreatIntel && hasDns) {
      return 'Emergency takedown — domain is flagged by threat intelligence and actively resolving. File registrar abuse report immediately and report to Google Safe Browsing.'
    }
    if (hasHomoglyph && hasDns && hasCert) {
      return 'High-confidence phishing infrastructure. File registrar abuse report for emergency takedown. Report to FS-ISAC and coordinate with brand security team.'
    }
    if (credentialKw && hasDns) {
      return 'Active credential harvesting threat. File registrar abuse report, report phishing URLs to Google Safe Browsing and Microsoft SmartScreen.'
    }
    if (hasDns && hasCert && hasRecentRdap) {
      return 'Recently registered with active infrastructure — likely pre-staged for phishing campaign. File preemptive registrar report and escalate to legal for UDRP.'
    }
    if (hasHomoglyph) {
      return 'Homoglyph-based impersonation domain. Investigate for active content and prepare registrar abuse report.'
    }
    return 'Investigate for impersonation/phishing and prepare registrar/platform escalation.'
  }

  // Medium
  if (hasDns && hasRecentRdap) {
    return 'Recently registered and resolving — monitor closely for content deployment. Prepare evidence package for potential escalation.'
  }
  if (hasDns) {
    return 'Domain is resolving. Investigate landing page content and collect evidence. Escalate if brand impersonation is confirmed.'
  }
  if (hasKeyword) {
    return 'Suspicious keyword variant. Check if domain is being used in email campaigns or ad fraud. Add to monitoring.'
  }
  return 'Collect evidence and review manually. Monitor for activation or content changes.'
}

// === Analyst Summary ===

/**
 * Build a specific, varied analyst summary from scan result signals.
 * Prioritizes the most dangerous signal combination for the lead sentence.
 */
export function generateAnalystSummary(result: ScanResult): string {
  const domainBase = result.domain.split('.')[0]
  const hasDns = result.signals.some((s) => s.type === 'dns')
  const hasCert = result.signals.some((s) => s.type === 'cert')
  const hasRecentRdap = result.signals.some((s) => s.type === 'rdap' && (s.raw as { isRecent?: boolean })?.isRecent === true)
  const hasUrlhaus = result.signals.some((s) => s.type === 'urlhaus')
  const hasOtx = result.signals.some((s) => s.type === 'otx')
  const hasSpamhaus = result.signals.some((s) => s.type === 'spamhaus')
  const hasThreatIntel = hasUrlhaus || hasOtx || hasSpamhaus
  const hasCredentialKeyword = CREDENTIAL_KEYWORDS.some((kw) => domainBase.includes(kw))
  const hasSupportKeyword = SUPPORT_KEYWORDS.some((kw) => domainBase.includes(kw))
  const isHomoglyph = result.generationMethod === 'homoglyph'

  const parts: string[] = []

  // Lead with the most dangerous combination
  if (hasThreatIntel && hasDns) {
    const sources: string[] = []
    if (hasUrlhaus) sources.push('URLhaus')
    if (hasSpamhaus) sources.push('Spamhaus DBL')
    if (hasOtx) sources.push('AlienVault OTX')
    parts.push(`Confirmed malicious domain — flagged by ${sources.join(' and ')} with active DNS resolution. This is an active threat requiring immediate action.`)
  } else if (isHomoglyph && hasDns && hasCert) {
    parts.push(`Homoglyph attack using visually deceptive characters to impersonate the brand. Active infrastructure with SSL certificate indicates a live phishing operation designed to harvest credentials.`)
  } else if (hasCredentialKeyword && hasDns && hasCert) {
    parts.push(`Credential-themed domain with active infrastructure. The combination of "${CREDENTIAL_KEYWORDS.find((kw) => domainBase.includes(kw))}" keyword, DNS resolution, and SSL certificate strongly suggests an active credential harvesting page.`)
  } else if (isHomoglyph && hasDns) {
    parts.push(`Homoglyph-based impersonation domain that is actively resolving. Visual similarity to the brand makes this a high-confidence impersonation threat.`)
  } else if (hasDns && hasCert && hasRecentRdap) {
    parts.push(`Recently registered domain with active infrastructure (DNS + SSL). Fresh registration combined with immediate infrastructure deployment is a strong indicator of malicious intent.`)
  } else if (hasCredentialKeyword && hasDns) {
    parts.push(`Domain contains credential-themed keyword "${CREDENTIAL_KEYWORDS.find((kw) => domainBase.includes(kw))}" and is actively resolving. Pattern is consistent with phishing or account takeover campaigns.`)
  } else if (hasSupportKeyword && hasDns) {
    parts.push(`Support/service-themed domain that is actively resolving. Pattern is consistent with tech support scams or fake customer service operations targeting brand customers.`)
  } else if (isHomoglyph) {
    parts.push(`Uses visually deceptive homoglyph characters to mimic the legitimate brand domain. Even without active infrastructure, this domain poses an impersonation risk if activated.`)
  } else if (hasDns && hasRecentRdap) {
    parts.push(`Recently registered domain that is actively resolving. Monitor closely for content deployment — recent registration of a brand-similar domain is a precursor to phishing campaigns.`)
  } else if (hasDns) {
    parts.push(`Domain is actively resolving, indicating deployed infrastructure. Investigate landing page content for brand impersonation or credential harvesting.`)
  } else if (hasCredentialKeyword) {
    parts.push(`Contains credential-themed keyword suggesting potential use for phishing. Currently not resolving but should be monitored for activation.`)
  } else if (result.similarity >= 0.8) {
    parts.push(`Close typographic variant of the brand domain. High visual similarity makes this attractive for typosquatting or future impersonation campaigns.`)
  } else {
    parts.push(`This domain has a low threat profile based on available signals. Monitor for changes.`)
  }

  // Add supplementary detail for cert
  if (hasCert && !parts[0].includes('SSL')) {
    const certSignal = result.signals.find((s) => s.type === 'cert')
    if (certSignal) parts.push(`SSL certificate detected: ${certSignal.value}.`)
  }

  return parts.join(' ')
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
      scoreContribution: 25,
    })
  } else if (supportKeyword) {
    signals.push({
      type: 'keyword',
      label: 'Suspicious keyword',
      value: `Contains "${supportKeyword}" — potential tech support scam`,
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
