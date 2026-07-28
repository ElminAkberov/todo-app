import { renderHook, act } from '@testing-library/react'
import useTodos from './useTodos'

// EXERCISE: Fill in each test body using renderHook and act
// Hook returns: { todos, filteredTodos, activeCount, filter, setFilter,
//                addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted }

describe('useTodos', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty todos', () => {
    // TODO: renderHook useTodos
    // TODO: assert todos is [] and activeCount is 0
  })

  it('addTodo appends a new todo', () => {
    // TODO: renderHook, then call addTodo('Buy milk') inside act()
    // TODO: assert todos has length 1 and todos[0].text === 'Buy milk'
  })

  it('addTodo trims whitespace', () => {
    // TODO: addTodo('  spaces  ')
    // TODO: assert todos[0].text === 'spaces'
  })

  it('addTodo assigns unique incrementing ids', () => {
    // TODO: add 'First' and 'Second'
    // TODO: assert their ids are different
  })

  it('toggleTodo flips completed', () => {
    // TODO: add a todo, toggle it → assert completed true
    // TODO: toggle again → assert completed false
  })

  it('deleteTodo removes the todo', () => {
    // TODO: add a todo, delete it
    // TODO: assert todos is empty
  })

  it('editTodo updates text', () => {
    // TODO: add 'Old text', edit it to 'New text'
    // TODO: assert todos[0].text === 'New text'
  })

  it('clearCompleted removes only completed todos', () => {
    // TODO: add 'Active' and 'Done', toggle 'Done', clearCompleted()
    // TODO: assert only 'Active' remains
  })

  it('activeCount counts only incomplete todos', () => {
    // TODO: add two todos, toggle one
    // TODO: assert activeCount === 1
  })

  describe('filtering', () => {
    it('filter=all returns all todos', () => {
      // TODO: add two todos, toggle one
      // TODO: assert filteredTodos has length 2
    })

    it('filter=active returns only incomplete', () => {
      // TODO: add two todos, toggle one, setFilter('active')
      // TODO: assert filteredTodos has length 1 and completed is false
    })

    it('filter=completed returns only completed', () => {
      // TODO: add two todos, toggle one, setFilter('completed')
      // TODO: assert filteredTodos has length 1 and completed is true
    })
  })
})
