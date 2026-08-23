import { Check, Pencil, X } from 'lucide-react'

import useTodoEdit from '@/hooks/useTodoEdit'
import PrioritySelect, { PriorityBadge } from '@/components/ui/PrioritySelect'
import Spinner from '@/components/ui/Spinner'
import type { Todo, TodoPriority } from '@/services/api/todos/todos.types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, patch: { title?: string; priority?: TodoPriority }) => void
  /**
   * A toggle or edit for this row is in flight. Delete has no pending state:
   * the row is removed from the cache optimistically and unmounts at once.
   */
  isPending?: boolean
}

function TodoItem({ todo, onToggle, onDelete, onEdit, isPending = false }: TodoItemProps) {
  const {
    isEditing,
    editValue,
    editPriority,
    setEditPriority,
    inputRef,
    startEditing,
    submitEdit,
    cancelEdit,
    handleChange,
    handleKeyDown,
  } = useTodoEdit(todo.title, todo.priority, onEdit, todo.id)

  const className = [
    'todo-item',
    todo.completed && 'todo-item--completed',
    isPending && 'todo-item--pending',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <li className={className}>
      <input
        className="todo-item__checkbox"
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      />

      {isEditing ? (
        <>
          <input
            ref={inputRef}
            className="todo-item__edit-input"
            type="text"
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <PrioritySelect value={editPriority} onChange={setEditPriority} size="small" />
          <button
            className="todo-item__save-btn"
            onClick={submitEdit}
            type="button"
            aria-label="Save changes"
            title="Save"
          >
            <Check size={15} aria-hidden="true" />
          </button>
          <button
            className="todo-item__cancel-btn"
            onClick={cancelEdit}
            type="button"
            aria-label="Cancel editing"
            title="Cancel"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </>
      ) : (
        <>
          <span
            className="todo-item__text"
            onDoubleClick={startEditing}
            title="Double-click to edit"
          >
            {todo.title}
          </span>
          <PriorityBadge priority={todo.priority} />
          {isPending ? (
            <span className="todo-item__status">
              <Spinner size="small" label="Saving" />
            </span>
          ) : (
            <div className="todo-item__actions">
              <button
                className="todo-item__action todo-item__action--edit"
                onClick={startEditing}
                type="button"
                aria-label={`Edit ${todo.title}`}
                title="Edit"
              >
                <Pencil size={15} aria-hidden="true" />
              </button>
              <button
                className="todo-item__action todo-item__action--delete"
                onClick={() => onDelete(todo.id)}
                type="button"
                aria-label={`Delete ${todo.title}`}
                title="Delete"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}
    </li>
  )
}

export default TodoItem
