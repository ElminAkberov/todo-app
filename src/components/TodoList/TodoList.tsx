import React, { Component } from 'react'
import TodoItem from '../TodoItem/TodoItem'
import { Todo, SortType } from '../../types'

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'alphabetical', label: 'A → Z' },
  { value: 'status', label: 'Active first' },
]

// TASK: Rewrite this class component as a functional component using hooks:
// - state: { sortBy } → useState<SortType>('alphabetical')
// - getSortedTodos becomes a regular const (or useMemo for bonus)
// - setSortBy becomes setState from the hook
// - Remove render(), return JSX directly

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (id: number, text: string) => void
}

interface TodoListState {
  sortBy: SortType
}

class TodoList extends Component<TodoListProps, TodoListState> {
  constructor(props: TodoListProps) {
    super(props)
    this.state = {
      sortBy: 'alphabetical',
    }
  }

  setSortBy = (sortBy: SortType) => {
    this.setState({ sortBy })
  }

  getSortedTodos(): Todo[] {
    const { todos } = this.props
    const { sortBy } = this.state

    if (sortBy === 'status') {
      return [...todos].sort((a, b) => Number(a.completed) - Number(b.completed))
    }
    return [...todos].sort((a, b) => a.text.localeCompare(b.text))
  }

  render() {
    const { onToggle, onDelete, onEdit } = this.props
    const { sortBy } = this.state
    const sortedTodos = this.getSortedTodos()

    return (
      <div className="todo-list-wrapper">
        <div className="todo-list__toolbar">
          <span className="todo-list__sort-label">Sort:</span>
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={`todo-list__sort-btn${sortBy === value ? ' todo-list__sort-btn--active' : ''}`}
              onClick={() => this.setSortBy(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {sortedTodos.length === 0 ? (
          <p className="todo-list__empty">No tasks here.</p>
        ) : (
          <ul className="todo-list">
            {sortedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </ul>
        )}
      </div>
    )
  }
}

export default TodoList
