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
    <div className={cn('flex flex-wrap items-center gap-2 sm:gap-3', className)}>
      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-9 sm:h-8 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors duration-[var(--duration-fast)]"
        />
      </div>

      {/* Filter dropdowns */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <select
            value={activeFilters[filter.key] || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            aria-label={`Filter by ${filter.label}`}
            className="h-9 sm:h-8 rounded-lg border border-border bg-surface pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors duration-[var(--duration-fast)]"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-tertiary" />
        </div>
      ))}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={() => filters.forEach((f) => onFilterChange(f.key, ''))}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-text-secondary hover:text-foreground transition-colors duration-[var(--duration-fast)]"
        >
          <X className="size-3" />
          Clear
        </button>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="w-full flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-text-secondary sm:text-xs">Filters:</span>
          {filters.map((filter) => {
            const value = activeFilters[filter.key]
            if (!value) return null
            const option = filter.options.find((o) => o.value === value)
            return (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key, '')}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-alt px-2 py-0.5 text-xs font-medium text-text-secondary hover:text-foreground transition-colors cursor-pointer"
              >
                {option?.label || value}
                <X className="size-2.5" aria-hidden="true" />
              </button>
            )
          })}
          {Object.values(activeFilters).filter((v) => v !== '').length > 1 && (
            <button
              onClick={() => filters.forEach((f) => onFilterChange(f.key, ''))}
              className="text-xs text-destructive hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
