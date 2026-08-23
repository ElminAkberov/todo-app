import { useState, type FormEvent, type ChangeEvent } from 'react'
import PrioritySelect from '@/components/ui/PrioritySelect'
import type { TodoPriority } from '@/services/api/todos/todos.types'

const MAX_LENGTH = 100

interface AddTodoProps {
  onAdd: (title: string, priority: TodoPriority) => Promise<void>
  isSubmitting?: boolean
  /** Server-side failure (e.g. 409 duplicate title) surfaced under the input. */
  serverError?: string | null
}

function AddTodo({ onAdd, isSubmitting = false, serverError = null }: AddTodoProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [priority, setPriority] = useState<TodoPriority>('MEDIUM')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = value.trim()

    if (!trimmed) {
      setError('Task cannot be empty.')
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Max ${MAX_LENGTH} characters.`)
      return
    }

    try {
      await onAdd(trimmed, priority)
      // Only clear on success, so a rejected title is not lost.
      setValue('')
      setError(null)
      setPriority('MEDIUM')
    } catch {
      // The parent reports the failure through serverError.
    }
  }

  const remaining = MAX_LENGTH - value.length
  const isOverLimit = remaining < 0
  const shownError = error ?? serverError

  return (
    <div className="add-todo-wrapper">
      <form className="add-todo" onSubmit={handleSubmit}>
        <input
          className={`add-todo__input${shownError ? ' add-todo__input--error' : ''}`}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          autoFocus
        />
        <PrioritySelect value={priority} onChange={setPriority} />
        <button className="add-todo__btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </form>

      <div className="add-todo__meta">
        {shownError ? (
          <span className="add-todo__error">{shownError}</span>
        ) : (
          <span
            className={`add-todo__counter${isOverLimit ? ' add-todo__counter--over' : ''}`}
          >
            {remaining} chars left
          </span>
        )}
      </div>
    </div>
  )
}

export default AddTodo
