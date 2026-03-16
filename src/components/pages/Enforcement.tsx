import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { EnforcementAction, ActionStatus, ActionType } from '@/types'
import DataTable, { type Column, type SortState } from '@/components/shared/DataTable'
import FilterBar, { type FilterDef } from '@/components/shared/FilterBar'
import DetailPanel from '@/components/shared/DetailPanel'
import StatusChip from '@/components/shared/StatusChip'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock } from 'lucide-react'

// === Filter definitions ===

const actionStatusOptions: ActionStatus[] = ['Queued', 'Sent', 'In Progress', 'Resolved', 'Denied']
const actionTypeOptions: ActionType[] = ['Takedown Notice', 'Registrar Report', 'Paid Search Complaint', 'Marketplace Report', 'Legal Escalation']

const filterDefs: FilterDef[] = [
  { key: 'status', label: 'Status', options: actionStatusOptions.map((s) => ({ label: s, value: s })) },
  { key: 'actionType', label: 'Type', options: actionTypeOptions.map((t) => ({ label: t, value: t })) },
  { key: 'vendorId', label: 'Vendor', options: [] }, // populated dynamically
]

// === SLA helpers ===

function getSlaStatus(action: EnforcementAction): 'ok' | 'warning' | 'breached' {
  if (action.status === 'Resolved' || action.status === 'Denied') return 'ok'
  const now = Date.now()
  const due = new Date(action.dueAt).getTime()
  if (now > due) return 'breached'
  const hoursLeft = (due - now) / 3600000
  if (hoursLeft < 6) return 'warning'
  return 'ok'
}

function formatSlaRemaining(action: EnforcementAction): string {
  if (action.status === 'Resolved' || action.status === 'Denied') {
    if (action.resolvedAt) {
      const resolved = new Date(action.resolvedAt).getTime()
      const due = new Date(action.dueAt).getTime()
      const diff = due - resolved
      if (diff >= 0) return `Closed ${Math.round(diff / 3600000)}h early`
      return `Closed ${Math.round(Math.abs(diff) / 3600000)}h late`
    }
    return 'Closed'
  }
  const now = Date.now()
  const due = new Date(action.dueAt).getTime()
  const diff = due - now
  if (diff <= 0) {
    const hoursOver = Math.round(Math.abs(diff) / 3600000)
    return `${hoursOver}h overdue`
  }
  const hoursLeft = Math.round(diff / 3600000)
  return `${hoursLeft}h remaining`
}

// === Column definitions ===

function ActionColumns(vendors: { id: string; name: string }[], cases: { id: string; title: string }[]): Column<EnforcementAction>[] {
  return [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      className: 'w-[80px] font-mono text-xs',
      render: (a) => <span className="text-muted-foreground">{a.id}</span>,
    },
    {
      key: 'actionType',
      label: 'Type',
      sortable: true,
      className: 'min-w-[150px]',
      render: (a) => <span className="text-foreground text-sm">{a.actionType}</span>,
    },
    {
      key: 'caseId',
      label: 'Case',
      sortable: true,
      className: 'w-[180px]',
      render: (a) => {
        const c = cases.find((cs) => cs.id === a.caseId)
        return (
          <div className="min-w-0">
            <span className="font-mono text-xs text-muted-foreground">{a.caseId}</span>
            {c && <p className="text-xs text-text-secondary truncate mt-0.5">{c.title.substring(0, 40)}...</p>}
          </div>
        )
      },
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      sortable: true,
      className: 'w-[150px]',
      render: (a) => {
        const v = vendors.find((vn) => vn.id === a.vendorId)
        return <span className="text-text-secondary text-xs">{v?.name ?? a.vendorId}</span>
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      className: 'w-[120px]',
      render: (a) => <StatusChip value={a.status} type="action-status" />,
    },
    {
      key: 'dueAt',
      label: 'SLA',
      sortable: true,
      className: 'w-[130px]',
      render: (a) => {
        const sla = getSlaStatus(a)
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
            sla === 'breached' ? 'text-destructive' : sla === 'warning' ? 'text-warning' : 'text-text-secondary'
          }`}>
            {sla === 'breached' && <AlertTriangle className="size-3" />}
            {sla === 'warning' && <Clock className="size-3" />}
            {formatSlaRemaining(a)}
          </span>
        )
      },
    },
    {
      key: 'requestedAt',
      label: 'Requested',
      sortable: true,
      className: 'w-[100px]',
      render: (a) => (
        <span className="text-muted-foreground text-xs">
          {new Date(a.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
  ]
}

// === Sort helper ===

function sortActions(actions: EnforcementAction[], sort: SortState): EnforcementAction[] {
  return [...actions].sort((a, b) => {
    let cmp = 0
    const key = sort.key as string

    if (key === 'status') {
      const order: Record<ActionStatus, number> = { Queued: 0, Sent: 1, 'In Progress': 2, Resolved: 3, Denied: 4 }
      cmp = order[a.status] - order[b.status]
    } else if (key === 'dueAt' || key === 'requestedAt') {
      cmp = new Date(a[key]).getTime() - new Date(b[key]).getTime()
    } else {
      const aVal = String((a as Record<string, unknown>)[key] ?? '')
      const bVal = String((b as Record<string, unknown>)[key] ?? '')
      cmp = aVal.localeCompare(bVal)
    }

    return sort.direction === 'asc' ? cmp : -cmp
  })
}

// === Detail Panel Content ===

function ActionDetail({ action }: { action: EnforcementAction }) {
  const { state, updateEnforcementStatus, addEnforcementNote } = useAppState()
  const navigate = useNavigate()
  const [noteText, setNoteText] = useState('')

  const vendor = state.vendors.find((v) => v.id === action.vendorId)
  const linkedCase = state.cases.find((c) => c.id === action.caseId)
  const sla = getSlaStatus(action)

  function handleAddNote() {
    if (!noteText.trim()) return
    addEnforcementNote(action.id, {
      id: `EN-${Date.now()}`,
      text: noteText.trim(),
      author: 'You',
      createdAt: new Date().toISOString(),
    })
    setNoteText('')
  }

  return (
    <div className="space-y-5">
      {/* Metadata */}
      <div className="space-y-3">
        <DetailRow label="Action Type" value={action.actionType} />
        <DetailRow label="Status">
          <StatusChip value={action.status} type="action-status" />
        </DetailRow>
        <DetailRow label="Vendor" value={vendor?.name ?? action.vendorId} />
        <DetailRow label="Region" value={vendor?.region ?? '—'} />
        <DetailRow label="Requested">
          {new Date(action.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </DetailRow>
      </div>

      {/* SLA Tracking */}
      <DetailSection title="SLA Tracking">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">SLA Window</span>
            <span className="text-sm font-medium text-foreground">{vendor?.slaHours ?? '—'}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Due</span>
            <span className="text-sm text-foreground">
              {new Date(action.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Status</span>
            <span className={`text-sm font-medium ${
              sla === 'breached' ? 'text-destructive' : sla === 'warning' ? 'text-warning' : 'text-success'
            }`}>
              {formatSlaRemaining(action)}
            </span>
          </div>
          {/* SLA bar */}
          {action.status !== 'Resolved' && action.status !== 'Denied' && (
            <div className="h-1.5 rounded-full bg-background overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-[var(--duration-slow)] ${
                  sla === 'breached' ? 'bg-destructive' : sla === 'warning' ? 'bg-warning' : 'bg-success'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(5, ((Date.now() - new Date(action.requestedAt).getTime()) / (new Date(action.dueAt).getTime() - new Date(action.requestedAt).getTime())) * 100))}%`
                }}
              />
            </div>
          )}
        </div>
      </DetailSection>

      {/* Outcome */}
      {action.outcome && (
        <DetailSection title="Outcome">
          <p className="text-sm text-text-secondary leading-relaxed">{action.outcome}</p>
        </DetailSection>
      )}

      {/* Linked Case */}
      {linkedCase && (
        <DetailSection title="Linked Case">
          <button
            onClick={() => navigate(`/investigation?case=${linkedCase.id}`)}
            className="w-full text-left rounded-xl bg-background p-3 hover:bg-surface-hover transition-colors duration-[var(--duration-fast)] cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">{linkedCase.id}</span>
              <StatusChip value={linkedCase.status} type="status" />
            </div>
            <p className="mt-1 text-sm text-foreground">{linkedCase.title}</p>
          </button>
        </DetailSection>
      )}

      {/* Status Control */}
      <DetailSection title="Update Status">
        <div className="flex flex-wrap gap-2">
          {actionStatusOptions.map((s) => (
            <Button
              key={s}
              variant={action.status === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateEnforcementStatus(action.id, s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </DetailSection>

      {/* Notes */}
      <DetailSection title={`Notes (${action.notes.length})`}>
        {action.notes.length > 0 && (
          <div className="space-y-3 mb-3">
            {action.notes.map((note) => (
              <div key={note.id} className="rounded-xl bg-background p-3">
                <p className="text-sm text-foreground">{note.text}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {note.author} &middot;{' '}
                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-tertiary resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <Button
          size="sm"
          className="mt-2"
          disabled={!noteText.trim()}
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </DetailSection>
    </div>
  )
}

// === Vendor Workload Summary ===

function VendorSummary() {
  const { state } = useAppState()

  const vendorStats = state.vendors.map((v) => {
    const actions = state.enforcementActions.filter((a) => a.vendorId === v.id)
    const active = actions.filter((a) => a.status !== 'Resolved' && a.status !== 'Denied').length
    const resolved = actions.filter((a) => a.status === 'Resolved').length
    const breached = actions.filter((a) => getSlaStatus(a) === 'breached').length
    return { ...v, total: actions.length, active, resolved, breached }
  })

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {vendorStats.map((v) => (
        <div key={v.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="text-sm font-medium text-foreground">{v.name}</div>
          <div className="mt-0.5 text-xs text-text-tertiary">{v.region} · {v.slaHours}h SLA</div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-xl font-bold text-foreground tabular-nums">{v.active}</span>
              <span className="ml-1 text-xs text-text-secondary">active</span>
            </div>
            <div>
              <span className="text-sm font-medium text-success tabular-nums">{v.resolved}</span>
              <span className="ml-1 text-xs text-text-secondary">done</span>
            </div>
            {v.breached > 0 && (
              <div>
                <span className="text-sm font-medium text-destructive tabular-nums">{v.breached}</span>
                <span className="ml-1 text-xs text-text-secondary">SLA</span>
              </div>
            )}
          </div>
        </div>
      ))}
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

// === Enforcement Page ===

export default function Enforcement() {
  const { state } = useAppState()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({ status: '', actionType: '', vendorId: '' })
  const [sort, setSort] = useState<SortState>({ key: 'dueAt', direction: 'asc' })
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)

  // Build dynamic vendor filter options
  const vendorFilterDefs = useMemo(() => {
    const vendorOptions = state.vendors.map((v) => ({ label: v.name, value: v.id }))
    return filterDefs.map((f) => f.key === 'vendorId' ? { ...f, options: vendorOptions } : f)
  }, [state.vendors])

  const columns = useMemo(
    () => ActionColumns(state.vendors, state.cases),
    [state.vendors, state.cases]
  )

  const filteredActions = useMemo(() => {
    let result = state.enforcementActions

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((a) => {
        const vendor = state.vendors.find((v) => v.id === a.vendorId)
        const caseData = state.cases.find((c) => c.id === a.caseId)
        return (
          a.id.toLowerCase().includes(q) ||
          a.actionType.toLowerCase().includes(q) ||
          (vendor?.name.toLowerCase().includes(q) ?? false) ||
          (caseData?.title.toLowerCase().includes(q) ?? false)
        )
      })
    }

    // Filters
    if (filters.status) result = result.filter((a) => a.status === filters.status)
    if (filters.actionType) result = result.filter((a) => a.actionType === filters.actionType)
    if (filters.vendorId) result = result.filter((a) => a.vendorId === filters.vendorId)

    // Sort
    result = sortActions(result, sort)

    return result
  }, [state.enforcementActions, state.vendors, state.cases, search, filters, sort])

  const selectedAction = selectedActionId
    ? state.enforcementActions.find((a) => a.id === selectedActionId) ?? null
    : null

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="relative">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Enforcement Tracker</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Vendor coordination and action pipeline — {filteredActions.length} of {state.enforcementActions.length} actions
          </p>
        </div>

        {/* Vendor workload summary */}
        <VendorSummary />

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search actions..."
          filters={vendorFilterDefs}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredActions}
          sort={sort}
          onSortChange={setSort}
          selectedId={selectedActionId}
          onRowClick={(a) => setSelectedActionId(a.id === selectedActionId ? null : a.id)}
          getRowId={(a) => a.id}
          emptyMessage="No enforcement actions match your filters."
        />
      </div>

      {/* Detail panel */}
      {selectedAction && (
        <DetailPanel
          open
          onClose={() => setSelectedActionId(null)}
          title={selectedAction.id}
          subtitle={selectedAction.actionType}
        >
          <ActionDetail action={selectedAction} />
        </DetailPanel>
      )}
    </div>
  )
}
