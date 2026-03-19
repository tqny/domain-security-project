import type { Vendor } from '../types'

export const defaultVendors: Vendor[] = [
  {
    id: 'VND-001',
    name: 'BrandShield Global',
    slaHours: 24,
    region: 'North America',
    notes: 'Primary enforcement partner. Handles domain takedowns and registrar reports.',
  },
  {
    id: 'VND-002',
    name: 'NetGuard Solutions',
    slaHours: 36,
    region: 'EMEA',
    notes: 'Specializes in European marketplace enforcement and GDPR-compliant actions.',
  },
  {
    id: 'VND-003',
    name: 'CyberEnforce Asia',
    slaHours: 48,
    region: 'APAC',
    notes: 'APAC coverage. Strong relationships with regional registrars.',
  },
  {
    id: 'VND-004',
    name: 'LegalForce Partners',
    slaHours: 48,
    region: 'Global',
    notes: 'Legal escalation partner. UDRP filings and cease & desist letters.',
  },
]
