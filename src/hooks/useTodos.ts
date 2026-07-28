import { useState } from 'react'
import { Todo, FilterType } from '../types'
import useLocalStorage from './useLocalStorage'

function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [])
  const [filter, setFilter] = useState<FilterType>('all')
  const [nextId, setNextId] = useState<number>(() => {
    try {
      const saved: Todo[] = JSON.parse(localStorage.getItem('todos') ?? '[]')
      return saved.length ? Math.max(...saved.map((t) => t.id)) + 1 : 1
    } catch {
      return 1
    }
  })

  const addTodo = (text: string) => {
    const newTodo: Todo = { id: nextId, text: text.trim(), completed: false }
    setTodos((prev) => [...prev, newTodo])
    setNextId((prev) => prev + 1)
  }

  const toggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const editTodo = (id: number, newText: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText.trim() } : t))
    )
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed))
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter((t) => !t.completed).length

  return {
    todos,
    filteredTodos,
    activeCount,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
  }
}

export default useTodos
