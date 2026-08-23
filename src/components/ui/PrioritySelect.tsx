import { PRIORITIES, type TodoPriority } from '@/services/api/todos/todos.types'

interface PrioritySelectProps {
  value: TodoPriority
  onChange: (priority: TodoPriority) => void
  /** Compact variant used inside a todo row while editing. */
  size?: 'default' | 'small'
  id?: string
}

const LABELS: Record<TodoPriority, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

function PrioritySelect({ value, onChange, size = 'default', id }: PrioritySelectProps) {
  return (
    <select
      id={id}
      className={`priority-select priority-select--${value.toLowerCase()}${
        size === 'small' ? ' priority-select--small' : ''
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value as TodoPriority)}
      aria-label="Priority"
    >
      {PRIORITIES.map((priority) => (
        <option key={priority} value={priority}>
          {LABELS[priority]}
        </option>
      ))}
    </select>
  )
}

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  return (
    <span
      className={`priority-badge priority-badge--${priority.toLowerCase()}`}
      title={`${LABELS[priority]} priority`}
    >
      {LABELS[priority]}
    </span>
  )
}

export default PrioritySelect
