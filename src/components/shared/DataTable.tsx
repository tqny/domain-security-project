import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render: (item: T) => React.ReactNode
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  sort: SortState
  onSortChange: (sort: SortState) => void
  selectedId?: string | null
  onRowClick?: (item: T) => void
  getRowId: (item: T) => string
  emptyMessage?: string
  className?: string
}

export default function DataTable<T>({
  columns,
  data,
  sort,
  onSortChange,
  selectedId,
  onRowClick,
  getRowId,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<T>) {
  function handleSort(key: string) {
    if (sort.key === key) {
      onSortChange({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ key, direction: 'asc' })
    }
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-alt">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-text-secondary',
                  col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors duration-[var(--duration-fast)]',
                  col.className
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && sort.key === col.key && (
                    sort.direction === 'asc'
                      ? <ChevronUp className="size-3.5" />
                      : <ChevronDown className="size-3.5" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const id = getRowId(item)
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
                    onRowClick && 'cursor-pointer',
                    selectedId === id
                      ? 'bg-accent-muted border-l-[3px] border-l-primary'
                      : 'hover:bg-surface-hover'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3.5', col.className)}>
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
