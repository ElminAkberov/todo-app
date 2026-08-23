import { ArrowDown, ArrowUp } from 'lucide-react'

import TodoItem from '@/components/TodoItem/TodoItem'
import type {
  SortOrder,
  SortType,
  Todo,
  TodoPriority,
} from '@/services/api/todos/todos.types'

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' },
  { value: 'updatedAt', label: 'Updated' },
]

interface TodoListProps {
  todos: Todo[]
  /** First load only — shows skeleton rows. */
  isInitialLoading: boolean
  /** A background refetch — keeps the rows and dims them slightly. */
  isRefreshing: boolean
  pendingIds: Set<string>
  sortBy: SortType
  sortOrder: SortOrder
  onSortChange: (sortBy: SortType, sortOrder: SortOrder) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: { title?: string; priority?: TodoPriority }) => void
}

/**
 * Sorting is delegated to the API (`sortBy` / `sortOrder`), so this component
 * renders the rows in the order it receives them.
 */
function TodoList({
  todos,
  isInitialLoading,
  isRefreshing,
  pendingIds,
  sortBy,
  sortOrder,
  onSortChange,
  onToggle,
  onDelete,
  onEdit,
}: TodoListProps) {
  // Clicking the active field flips direction; a new field starts descending.
  const handleSortClick = (value: SortType) => {
    if (value === sortBy) {
      onSortChange(value, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(value, 'desc')
    }
  }

  return (
    <div className="todo-list-wrapper">
      <div className="todo-list__toolbar">
        <span className="todo-list__sort-label">Sort:</span>
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`todo-list__sort-btn${
              sortBy === value ? ' todo-list__sort-btn--active' : ''
            }`}
            onClick={() => handleSortClick(value)}
          >
            {label}
            {sortBy === value && (
              <span className="todo-list__sort-arrow" aria-hidden="true">
                {sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              </span>
            )}
          </button>
        ))}
      </div>

      {isInitialLoading ? (
        <ul className="todo-list" aria-busy="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="todo-item todo-item--skeleton">
              <span className="skeleton skeleton--checkbox" />
              <span className="skeleton skeleton--text" />
              <span className="skeleton skeleton--badge" />
            </li>
          ))}
        </ul>
      ) : todos.length === 0 ? (
        <p className="todo-list__empty">No tasks here.</p>
      ) : (
        // Rows stay mounted during a refetch; only the opacity shifts, so the
        // list no longer collapses and re-expands on every change.
        <ul
          className={`todo-list${isRefreshing ? ' todo-list--refreshing' : ''}`}
          aria-busy={isRefreshing}
        >
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isPending={pendingIds.has(todo.id)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export default TodoList
