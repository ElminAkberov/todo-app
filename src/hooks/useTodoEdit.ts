import { useEffect, useRef, useState } from 'react'
import type { TodoPriority } from '@/services/api/todos/todos.types'

interface EditPatch {
  title?: string
  priority?: TodoPriority
}

/**
 * Inline-edit state for a single todo row.
 * `onEdit` receives only the fields that actually changed.
 */
function useTodoEdit(
  originalTitle: string,
  originalPriority: TodoPriority,
  onEdit: (id: string, patch: EditPatch) => void,
  id: string
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editPriority, setEditPriority] = useState<TodoPriority>(originalPriority)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const startEditing = () => {
    setIsEditing(true)
    setEditValue(originalTitle)
    setEditPriority(originalPriority)
  }

  const submitEdit = () => {
    const trimmed = editValue.trim()
    const patch: EditPatch = {}
    if (trimmed && trimmed !== originalTitle) patch.title = trimmed
    if (editPriority !== originalPriority) patch.priority = editPriority

    // The API rejects an empty patch with 400 "No fields to update".
    if (Object.keys(patch).length > 0) onEdit(id, patch)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return {
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
  }
}

export default useTodoEdit
