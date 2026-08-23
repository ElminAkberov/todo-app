import { X } from 'lucide-react'

import Spinner from '@/components/ui/Spinner'
import { PRIORITIES, type TodoPriority } from '@/services/api/todos/todos.types'

interface TodoToolbarProps {
  search: string
  onSearchChange: (search: string) => void
  priority: TodoPriority | null
  onPriorityChange: (priority: TodoPriority | null) => void
  /** A search/filter request is in flight. */
  isSearching?: boolean
}

const LABELS: Record<TodoPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

/** Server-side search (`search`) and priority filter (`priority`). */
function TodoToolbar({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  isSearching = false,
}: TodoToolbarProps) {
  return (
    <div className="todo-toolbar">
      <div className="todo-toolbar__search">
        <input
          className="todo-toolbar__search-input"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          aria-label="Search tasks"
        />
        {isSearching ? (
          <span className="todo-toolbar__search-status">
            <Spinner size="small" label="Searching" />
          </span>
        ) : (
          search && (
            <button
              className="todo-toolbar__search-clear"
              onClick={() => onSearchChange('')}
              type="button"
              aria-label="Clear search"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )
        )}
      </div>

      {/*
        The status filter in the footer also has an "All" button, so this one
        is labelled for assistive tech (and tests) to tell them apart.
      */}
      <div className="todo-toolbar__priorities" role="group" aria-label="Filter by priority">
        <button
          type="button"
          className={`todo-toolbar__priority-btn${
            priority === null ? ' todo-toolbar__priority-btn--active' : ''
          }`}
          onClick={() => onPriorityChange(null)}
          aria-label="All priorities"
        >
          All
        </button>
        {PRIORITIES.map((value) => (
          <button
            key={value}
            type="button"
            className={`todo-toolbar__priority-btn todo-toolbar__priority-btn--${value.toLowerCase()}${
              priority === value ? ' todo-toolbar__priority-btn--active' : ''
            }`}
            onClick={() => onPriorityChange(value)}
          >
            {LABELS[value]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TodoToolbar
