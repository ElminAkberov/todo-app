import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import type { FilterType } from '@/services/api/todos/todos.types'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

interface TodoFilterProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

/** Completion filter. Sent to the API as the `status` query parameter. */
function TodoFilter({ currentFilter, onFilterChange }: TodoFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  const toggleOpen = () => setIsOpen((prev) => !prev)

  return (
    <div className="todo-filter">
      <button className="todo-filter__toggle" onClick={toggleOpen} type="button">
        <SlidersHorizontal size={13} aria-hidden="true" />
        Filter
        {isOpen ? (
          <ChevronUp size={13} aria-hidden="true" />
        ) : (
          <ChevronDown size={13} aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="todo-filter__options" role="group" aria-label="Filter by status">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`todo-filter__btn${
                currentFilter === value ? ' todo-filter__btn--active' : ''
              }`}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TodoFilter
