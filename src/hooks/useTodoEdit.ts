import { useState, useRef, useEffect } from 'react'

function useTodoEdit(
  originalText: string,
  onEdit: (id: number, text: string) => void,
  id: number
) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  const startEditing = () => {
    setIsEditing(true)
    setEditValue(originalText)
  }

  const submitEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed) {
      onEdit(id, trimmed)
    }
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
    inputRef,
    startEditing,
    submitEdit,
    cancelEdit,
    handleChange,
    handleKeyDown,
  }
}

export default useTodoEdit
