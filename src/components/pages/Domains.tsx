import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { Domain, DomainStatus } from '@/types'
import DataTable, { type Column, type SortState } from '@/components/shared/DataTable'
import FilterBar, { type FilterDef } from '@/components/shared/FilterBar'
import DetailPanel from '@/components/shared/DetailPanel'
import StatusChip from '@/components/shared/StatusChip'
import { Button } from '@/components/ui/button'
import { Shield, ShieldOff, Lock, Unlock, Eye, EyeOff, AlertTriangle } from 'lucide-react'

// === Filter definitions ===

const domainStatusOptions: DomainStatus[] = ['Incident', 'Active', 'Monitoring', 'Suspended']
const registrarOptions = ['Namecheap', 'GoDaddy', 'Tucows', 'Cloudflare']

const filterDefs: FilterDef[] = [
  { key: 'status', label: 'Status', options: domainStatusOptions.map((s) => ({ label: s, value: s })) },
  { key: 'registrar', label: 'Registrar', options: registrarOptions.map((r) => ({ label: r, value: r })) },
]

// === Column definitions ===

function SecurityIcon({ enabled, EnabledIcon, DisabledIcon, label }: { enabled: boolean; EnabledIcon: React.ComponentType<{ className?: string }>; DisabledIcon: React.ComponentType<{ className?: string }>; label: string }) {
  const Icon = enabled ? EnabledIcon : DisabledIcon
  return (
    <span title={`${label}: ${enabled ? 'Enabled' : 'Disabled'}`}>
      <Icon className={`size-3.5 ${enabled ? 'text-success' : 'text-muted-foreground/50'}`} />
    </span>
  )
}

const columns: Column<Domain>[] = [
  {
    key: 'domainName',
    label: 'Domain',
    sortable: true,
    className: 'min-w-[200px]',
    render: (d) => <span className="font-mono text-sm text-foreground">{d.domainName}</span>,
  },
  {
    key: 'registrar',
    label: 'Registrar',
    sortable: true,
    className: 'w-[120px]',
    render: (d) => <span className="text-text-secondary text-xs">{d.registrar}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    className: 'w-[110px]',
    render: (d) => <StatusChip value={d.status} type="domain-status" />,
  },
  {
    key: 'dnsSecurity',
    label: 'Security',
    sortable: false,
    className: 'w-[100px]',
    render: (d) => (
      <div className="flex items-center gap-2">
        <SecurityIcon enabled={d.dnsSecurity.dnssec} EnabledIcon={Shield} DisabledIcon={ShieldOff} label="DNSSEC" />
        <SecurityIcon enabled={d.dnsSecurity.registryLock} EnabledIcon={Lock} DisabledIcon={Unlock} label="Registry Lock" />
        <SecurityIcon enabled={d.dnsSecurity.whoisPrivacy} EnabledIcon={Eye} DisabledIcon={EyeOff} label="WHOIS Privacy" />
      </div>
    ),
  },
  {
    key: 'riskFlags',
    label: 'Flags',
    sortable: true,
    className: 'w-[70px] text-center',
    render: (d) =>
      d.riskFlags.length > 0 ? (
        <span className="inline-flex items-center gap-1 text-warning text-xs font-medium">
          <AlertTriangle className="size-3" />
          {d.riskFlags.length}
        </span>
      ) : (
        <span className="text-muted-foreground/50 text-xs">—</span>
      ),
  },
  {
    key: 'expiresOn',
    label: 'Expires',
    sortable: true,
    className: 'w-[100px]',
    render: (d) => (
      <span className="text-muted-foreground text-xs">
        {new Date(d.expiresOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    ),
  },
  {
    key: 'lastFlaggedAt',
    label: 'Last Flagged',
    sortable: true,
    className: 'w-[100px]',
    render: (d) => (
      <span className="text-muted-foreground text-xs">
        {d.lastFlaggedAt
          ? new Date(d.lastFlaggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—'}
      </span>
    ),
  },
]

// === Sort helper ===

function sortDomains(domains: Domain[], sort: SortState): Domain[] {
  return [...domains].sort((a, b) => {
    let cmp = 0
    const key = sort.key as string

    if (key === 'status') {
      const order: Record<DomainStatus, number> = { Incident: 0, Active: 1, Monitoring: 2, Suspended: 3 }
      cmp = order[a.status] - order[b.status]
    } else if (key === 'riskFlags') {
      cmp = a.riskFlags.length - b.riskFlags.length
    } else if (key === 'lastFlaggedAt') {
      const aTime = a.lastFlaggedAt ? new Date(a.lastFlaggedAt).getTime() : 0
      const bTime = b.lastFlaggedAt ? new Date(b.lastFlaggedAt).getTime() : 0
      cmp = aTime - bTime
    } else {
      const aVal = String((a as Record<string, unknown>)[key] ?? '')
      const bVal = String((b as Record<string, unknown>)[key] ?? '')
      cmp = aVal.localeCompare(bVal)
    }

    return sort.direction === 'asc' ? cmp : -cmp
  })
}

// === Detail Panel Content ===

function DomainDetail({ domain }: { domain: Domain }) {
  const { state, addDomainActionLog } = useAppState()
  const navigate = useNavigate()
  const [logText, setLogText] = useState('')

  const linkedCases = state.cases.filter((c) => c.linkedDomainId === domain.id)

  function handleAddLog() {
    if (!logText.trim()) return
    addDomainActionLog(domain.id, {
      id: `LOG-${Date.now()}`,
      action: logText.trim(),
      performedBy: 'You',
      performedAt: new Date().toISOString(),
    })
    setLogText('')
  }

  return (
    <div className="space-y-5">
      {/* Metadata */}
      <div className="space-y-3">
        <DetailRow label="Domain">
          <span className="font-mono text-sm">{domain.domainName}</span>
        </DetailRow>
        <DetailRow label="Registrar" value={domain.registrar} />
        <DetailRow label="Status">
          <StatusChip value={domain.status} type="domain-status" />
        </DetailRow>
        <DetailRow label="Expires">
          {new Date(domain.expiresOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </DetailRow>
        {domain.lastFlaggedAt && (
          <DetailRow label="Last Flagged">
            {new Date(domain.lastFlaggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </DetailRow>
        )}
      </div>

      {/* Security Controls */}
      <DetailSection title="Security Controls">
        <div className="space-y-2.5">
          <SecurityRow label="DNSSEC" enabled={domain.dnsSecurity.dnssec} />
          <SecurityRow label="Registry Lock" enabled={domain.dnsSecurity.registryLock} />
          <SecurityRow label="WHOIS Privacy" enabled={domain.dnsSecurity.whoisPrivacy} />
        </div>
      </DetailSection>

      {/* Risk Flags */}
      {domain.riskFlags.length > 0 && (
        <DetailSection title={`Risk Flags (${domain.riskFlags.length})`}>
          <div className="space-y-1.5">
            {domain.riskFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-warning" />
                <span className="text-text-secondary">{flag}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {/* Notes */}
      {domain.notes && (
        <DetailSection title="Notes">
          <p className="text-sm text-text-secondary leading-relaxed">{domain.notes}</p>
        </DetailSection>
      )}

      {/* Linked Cases */}
      {linkedCases.length > 0 && (
        <DetailSection title={`Linked Cases (${linkedCases.length})`}>
          <div className="space-y-2">
            {linkedCases.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/investigation?case=${c.id}`)}
                className="w-full text-left rounded-xl bg-background p-3 hover:bg-surface-hover transition-colors duration-[var(--duration-fast)] cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                  <StatusChip value={c.status} type="status" />
                </div>
                <p className="mt-1 text-sm text-foreground">{c.title}</p>
              </button>
            ))}
          </div>
        </DetailSection>
      )}

      {/* Action Log */}
      <DetailSection title={`Registrar Action Log (${domain.actionLog.length})`}>
        {domain.actionLog.length > 0 && (
          <div className="space-y-3 mb-3">
            {[...domain.actionLog].reverse().map((entry) => (
              <div key={entry.id} className="rounded-xl bg-background p-3">
                <p className="text-sm text-foreground">{entry.action}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {entry.performedBy} &middot;{' '}
                  {new Date(entry.performedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Add a log entry..."
            rows={2}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Button
          size="sm"
          className="mt-2"
          disabled={!logText.trim()}
          onClick={handleAddLog}
        >
          Add Entry
        </Button>
      </DetailSection>
    </div>
  )
}

// === Helper sub-components ===

function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children ?? value}</span>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function SecurityRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={`text-xs font-medium ${enabled ? 'text-success' : 'text-muted-foreground'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  )
}

// === Domains Page ===

export default function Domains() {
  const { state } = useAppState()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({ status: '', registrar: '' })
  const [sort, setSort] = useState<SortState>({ key: 'status', direction: 'asc' })
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null)

  const filteredDomains = useMemo(() => {
    let result = state.domains

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (d) =>
          d.domainName.toLowerCase().includes(q) ||
          d.registrar.toLowerCase().includes(q) ||
          d.notes.toLowerCase().includes(q) ||
          d.riskFlags.some((f) => f.toLowerCase().includes(q))
      )
    }

    // Filters
    if (filters.status) result = result.filter((d) => d.status === filters.status)
    if (filters.registrar) result = result.filter((d) => d.registrar === filters.registrar)

    // Sort
    result = sortDomains(result, sort)

    return result
  }, [state.domains, search, filters, sort])

  const selectedDomain = selectedDomainId ? state.domains.find((d) => d.id === selectedDomainId) ?? null : null

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Domain Portfolio</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Monitored domains and security posture — {filteredDomains.length} of {state.domains.length} domains
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search domains..."
          filters={filterDefs}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredDomains}
          sort={sort}
          onSortChange={setSort}
          selectedId={selectedDomainId}
          onRowClick={(d) => setSelectedDomainId(d.id === selectedDomainId ? null : d.id)}
          getRowId={(d) => d.id}
          emptyMessage="No domains match your filters."
        />
      </div>

      {/* Detail panel — overlay */}
      {selectedDomain && (
        <DetailPanel
          open
          onClose={() => setSelectedDomainId(null)}
          title={selectedDomain.domainName}
          subtitle={`${selectedDomain.registrar} · ${selectedDomain.status}`}
        >
          <DomainDetail domain={selectedDomain} />
        </DetailPanel>
      )}
    </div>
  )
}
