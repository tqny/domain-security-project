import { cn } from '@/lib/utils'
import { Search, X, ChevronDown } from 'lucide-react'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
}

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters: FilterDef[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  className?: string
}

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  activeFilters,
  onFilterChange,
  className,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== '')

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="h-8 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={activeFilters[filter.key] || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="h-8 rounded-lg border border-border bg-surface pl-3 pr-8 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        </div>
      ))}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => filters.forEach((f) => onFilterChange(f.key, ''))}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-[120ms]"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  )
}
