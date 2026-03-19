import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 25],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)))
  }

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const rangeEnd = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="hidden sm:inline">Rows per page:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger className="h-8 sm:h-7 w-[60px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-text-secondary tabular-nums">
          {rangeStart}–{rangeEnd} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-1">
        <Button variant="outline" size="icon" className="size-9 sm:size-7" onClick={() => goToPage(1)} disabled={currentPage === 1} aria-label="First page">
          <ChevronsLeft className="size-4 sm:size-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="size-9 sm:size-7" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">
          <ChevronLeft className="size-4 sm:size-3.5" />
        </Button>

        <div className="flex items-center gap-1.5 sm:gap-1 px-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'ghost'}
                size="icon"
                className="size-9 sm:size-7 text-xs"
                onClick={() => goToPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        <Button variant="outline" size="icon" className="size-9 sm:size-7" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} aria-label="Next page">
          <ChevronRight className="size-4 sm:size-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="size-9 sm:size-7" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} aria-label="Last page">
          <ChevronsRight className="size-4 sm:size-3.5" />
        </Button>
      </div>
    </div>
  )
}
