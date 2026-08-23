import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

import type { PaginationMeta } from '@/services/api/todos/todos.types'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

/** Builds a compact page list with ellipses, e.g. 1 … 4 [5] 6 … 12 */
function buildPages(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'gap')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('gap')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('gap')
  pages.push(total)

  return pages
}

function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = meta

  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        type="button"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} aria-hidden="true" />
      </button>

      {buildPages(page, totalPages).map((entry, i) =>
        entry === 'gap' ? (
          <span key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
            <MoreHorizontal size={14} />
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            className={`pagination__btn${
              entry === page ? ' pagination__btn--active' : ''
            }`}
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? 'page' : undefined}
          >
            {entry}
          </button>
        )
      )}

      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        type="button"
        aria-label="Next page"
      >
        <ChevronRight size={15} aria-hidden="true" />
      </button>

      <span className="pagination__total">{total} total</span>
    </nav>
  )
}

export default Pagination
