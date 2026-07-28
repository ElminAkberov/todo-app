import { renderHook, act } from '@testing-library/react'
import useTodos from './useTodos'

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty todos', () => {
    const { result } = renderHook(() => useTodos())
    expect(result.current.todos).toEqual([])
    expect(result.current.activeCount).toBe(0)
  })

  it('addTodo appends a new todo', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('Buy milk'))
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Buy milk')
    expect(result.current.todos[0].completed).toBe(false)
  })

  it('addTodo trims whitespace', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('  spaces  '))
    expect(result.current.todos[0].text).toBe('spaces')
  })

  it('addTodo assigns unique incrementing ids', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('First'))
    act(() => result.current.addTodo('Second'))
    const ids = result.current.todos.map((t) => t.id)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('toggleTodo flips completed', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('Task'))
    const id = result.current.todos[0].id
    act(() => result.current.toggleTodo(id))
    expect(result.current.todos[0].completed).toBe(true)
    act(() => result.current.toggleTodo(id))
    expect(result.current.todos[0].completed).toBe(false)
  })

  it('deleteTodo removes the todo', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('Task'))
    const id = result.current.todos[0].id
    act(() => result.current.deleteTodo(id))
    expect(result.current.todos).toHaveLength(0)
  })

  it('editTodo updates text', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('Old text'))
    const id = result.current.todos[0].id
    act(() => result.current.editTodo(id, 'New text'))
    expect(result.current.todos[0].text).toBe('New text')
  })

  it('clearCompleted removes only completed todos', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('Active'))
    act(() => result.current.addTodo('Done'))
    const doneId = result.current.todos[1].id
    act(() => result.current.toggleTodo(doneId))
    act(() => result.current.clearCompleted())
    expect(result.current.todos).toHaveLength(1)
    expect(result.current.todos[0].text).toBe('Active')
  })

  it('activeCount counts only incomplete todos', () => {
    const { result } = renderHook(() => useTodos())
    act(() => result.current.addTodo('A'))
    act(() => result.current.addTodo('B'))
    act(() => result.current.toggleTodo(result.current.todos[0].id))
    expect(result.current.activeCount).toBe(1)
  })

  describe('filtering', () => {
    it('filter=all returns all todos', () => {
      const { result } = renderHook(() => useTodos())
      act(() => result.current.addTodo('A'))
      act(() => result.current.addTodo('B'))
      act(() => result.current.toggleTodo(result.current.todos[0].id))
      expect(result.current.filteredTodos).toHaveLength(2)
    })

    it('filter=active returns only incomplete', () => {
      const { result } = renderHook(() => useTodos())
      act(() => result.current.addTodo('A'))
      act(() => result.current.addTodo('B'))
      act(() => result.current.toggleTodo(result.current.todos[0].id))
      act(() => result.current.setFilter('active'))
      expect(result.current.filteredTodos).toHaveLength(1)
      expect(result.current.filteredTodos[0].completed).toBe(false)
    })

    it('filter=completed returns only completed', () => {
      const { result } = renderHook(() => useTodos())
      act(() => result.current.addTodo('A'))
      act(() => result.current.addTodo('B'))
      act(() => result.current.toggleTodo(result.current.todos[0].id))
      act(() => result.current.setFilter('completed'))
      expect(result.current.filteredTodos).toHaveLength(1)
      expect(result.current.filteredTodos[0].completed).toBe(true)
    })
  })
})
