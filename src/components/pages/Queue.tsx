import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppState } from '@/data/store'
import type { Case, CaseStatus, Priority } from '@/types'
import DataTable, { type Column, type SortState } from '@/components/shared/DataTable'
import FilterBar, { type FilterDef } from '@/components/shared/FilterBar'
import DetailPanel from '@/components/shared/DetailPanel'
import StatusChip from '@/components/shared/StatusChip'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

// === Filter definitions ===

const statusOptions: CaseStatus[] = ['New', 'Triaged', 'Investigating', 'Enforcement', 'Closed']
const priorityOptions: Priority[] = ['Critical', 'High', 'Medium', 'Low']
const channelOptions = ['Domain', 'Marketplace', 'Paid Search', 'App', 'Social']

const filterDefs: FilterDef[] = [
  { key: 'status', label: 'Status', options: statusOptions.map((s) => ({ label: s, value: s })) },
  { key: 'priority', label: 'Priority', options: priorityOptions.map((p) => ({ label: p, value: p })) },
  { key: 'channel', label: 'Channel', options: channelOptions.map((c) => ({ label: c, value: c })) },
]

// === Column definitions ===

const columns: Column<Case>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    className: 'w-[90px] font-mono text-xs',
    render: (c) => <span className="text-muted-foreground">{c.id}</span>,
  },
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    className: 'min-w-[200px]',
    render: (c) => <span className="text-foreground">{c.title}</span>,
  },
  {
    key: 'channel',
    label: 'Channel',
    sortable: true,
    className: 'w-[110px]',
    render: (c) => <span className="text-text-secondary text-xs">{c.channel}</span>,
  },
  {
    key: 'priority',
    label: 'Priority',
    sortable: true,
    className: 'w-[100px]',
    render: (c) => <StatusChip value={c.priority} type="priority" />,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    className: 'w-[120px]',
    render: (c) => <StatusChip value={c.status} type="status" />,
  },
  {
    key: 'riskScore',
    label: 'Risk',
    sortable: true,
    className: 'w-[70px] text-right',
    render: (c) => (
      <span className={c.riskScore >= 80 ? 'text-destructive font-medium' : c.riskScore >= 60 ? 'text-warning' : 'text-muted-foreground'}>
        {c.riskScore}
      </span>
    ),
  },
  {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    className: 'w-[120px]',
    render: (c) => (
      <span className="text-text-secondary text-xs">
        {c.owner || <span className="italic text-muted-foreground">Unassigned</span>}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    className: 'w-[100px]',
    render: (c) => (
      <span className="text-muted-foreground text-xs">
        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    ),
  },
]

// === Sort helper ===

function sortCases(cases: Case[], sort: SortState): Case[] {
  return [...cases].sort((a, b) => {
    let cmp = 0
    const key = sort.key as keyof Case

    if (key === 'riskScore') {
      cmp = (a.riskScore) - (b.riskScore)
    } else if (key === 'priority') {
      const order: Record<Priority, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      cmp = order[a.priority] - order[b.priority]
    } else if (key === 'status') {
      const order: Record<CaseStatus, number> = { New: 0, Triaged: 1, Investigating: 2, Enforcement: 3, Closed: 4 }
      cmp = order[a.status] - order[b.status]
    } else {
      const aVal = String(a[key] ?? '')
      const bVal = String(b[key] ?? '')
      cmp = aVal.localeCompare(bVal)
    }

    return sort.direction === 'asc' ? cmp : -cmp
  })
}

// === Detail Panel Content ===

function CaseDetail({ caseData }: { caseData: Case }) {
  const { updateCaseStatus, setCaseOwner, addCaseNote, escalateCasePriority } = useAppState()
  const navigate = useNavigate()
  const [noteText, setNoteText] = useState('')

  function handleAddNote() {
    if (!noteText.trim()) return
    addCaseNote(caseData.id, {
      id: `N-${Date.now()}`,
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
        <DetailRow label="Channel" value={caseData.channel} />
        <DetailRow label="Threat Type" value={caseData.threatType} />
        <DetailRow label="Risk Score">
          <span className={caseData.riskScore >= 80 ? 'text-destructive font-medium' : caseData.riskScore >= 60 ? 'text-warning' : 'text-foreground'}>
            {caseData.riskScore}/100
          </span>
        </DetailRow>
        <DetailRow label="Priority">
          <StatusChip value={caseData.priority} type="priority" />
        </DetailRow>
        <DetailRow label="Status">
          <StatusChip value={caseData.status} type="status" />
        </DetailRow>
        <DetailRow label="Created">
          {new Date(caseData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </DetailRow>
        {caseData.linkedDomainId && (
          <DetailRow label="Linked Domain">
            <button
              onClick={() => navigate('/domains')}
              className="text-primary hover:underline text-sm cursor-pointer"
            >
              {caseData.linkedDomainId}
            </button>
          </DetailRow>
        )}
      </div>

      {/* Summary */}
      <DetailSection title="Summary">
        <p className="text-sm text-text-secondary leading-relaxed">{caseData.summary}</p>
      </DetailSection>

      {/* AI Summary */}
      <DetailSection title="AI Analysis">
        <p className="text-sm text-text-secondary leading-relaxed">{caseData.aiSummary}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-primary">Suggested:</span> {caseData.aiSuggestedAction}
        </p>
      </DetailSection>

      {/* Status Control */}
      <DetailSection title="Update Status">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <Button
              key={s}
              variant={caseData.status === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateCaseStatus(caseData.id, s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </DetailSection>

      {/* Priority Control */}
      <DetailSection title="Priority">
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((p) => (
            <Button
              key={p}
              variant={caseData.priority === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => escalateCasePriority(caseData.id, p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </DetailSection>

      {/* Owner */}
      <DetailSection title="Owner">
        <select
          value={caseData.owner}
          onChange={(e) => setCaseOwner(caseData.id, e.target.value)}
          className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Unassigned</option>
          <option value="Sarah Chen">Sarah Chen</option>
          <option value="Marcus Johnson">Marcus Johnson</option>
        </select>
      </DetailSection>

      {/* Notes */}
      <DetailSection title={`Notes (${caseData.notes.length})`}>
        {caseData.notes.length > 0 && (
          <div className="space-y-3 mb-3">
            {caseData.notes.map((note) => (
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
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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

// === Queue Page ===

export default function Queue() {
  const { state, updateCaseStatus, escalateCasePriority } = useAppState()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({ status: '', priority: '', channel: '' })
  const [sort, setSort] = useState<SortState>({ key: 'createdAt', direction: 'desc' })
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters])

  const columnsWithActions = useMemo<Column<Case>[]>(() => [
    ...columns,
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-[40px]',
      render: (c: Case) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 text-text-secondary hover:text-foreground" onClick={(e) => e.stopPropagation()} aria-label="Actions">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/investigation?case=${c.id}`)}>Investigate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => escalateCasePriority(c.id, 'Critical')}>Escalate Priority</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => updateCaseStatus(c.id, 'Closed')}>Close Case</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [navigate, escalateCasePriority, updateCaseStatus])

  const filteredCases = useMemo(() => {
    let result = state.cases

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q)
      )
    }

    // Filters
    if (filters.status) result = result.filter((c) => c.status === filters.status)
    if (filters.priority) result = result.filter((c) => c.priority === filters.priority)
    if (filters.channel) result = result.filter((c) => c.channel === filters.channel)

    // Sort
    result = sortCases(result, sort)

    return result
  }, [state.cases, search, filters, sort])

  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCases.slice(start, start + pageSize)
  }, [filteredCases, currentPage, pageSize])

  const selectedCase = selectedCaseId ? state.cases.find((c) => c.id === selectedCaseId) ?? null : null

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="relative">
      {/* Main content */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Case Queue</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Threat intake and triage — {filteredCases.length} of {state.cases.length} cases
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search cases..."
          filters={filterDefs}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Table */}
        <DataTable
          columns={columnsWithActions}
          data={paginatedCases}
          sort={sort}
          onSortChange={setSort}
          selectedId={selectedCaseId}
          onRowClick={(c) => setSelectedCaseId(c.id === selectedCaseId ? null : c.id)}
          getRowId={(c) => c.id}
          emptyMessage="No cases match your filters."
          pagination={{
            currentPage,
            pageSize,
            totalItems: filteredCases.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>

      {/* Detail panel — overlay */}
      {selectedCase && (
        <DetailPanel
          open
          onClose={() => setSelectedCaseId(null)}
          title={selectedCase.id}
          subtitle={selectedCase.title}
        >
          <CaseDetail caseData={selectedCase} />
        </DetailPanel>
      )}
    </div>
  )
}
