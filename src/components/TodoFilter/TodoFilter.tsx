import React, { Component } from 'react'
import { FilterType } from '../types'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

// TASK: Rewrite this class component as a functional component using hooks:
// - state: { isOpen } → useState(true)
// - toggleOpen becomes a regular const function
// - Remove render(), return JSX directly

interface TodoFilterProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

interface TodoFilterState {
  isOpen: boolean
}

class TodoFilter extends Component<TodoFilterProps, TodoFilterState> {
  constructor(props: TodoFilterProps) {
    super(props)
    this.state = {
      isOpen: true,
    }
  }

  toggleOpen = () => {
    this.setState((prev) => ({ isOpen: !prev.isOpen }))
  }

  render() {
    const { currentFilter, onFilterChange } = this.props
    const { isOpen } = this.state

    return (
      <div className="todo-filter">
        <button className="todo-filter__toggle" onClick={this.toggleOpen}>
          Filter {isOpen ? '▲' : '▼'}
        </button>

        {isOpen && (
          <div className="todo-filter__options">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                className={`todo-filter__btn${currentFilter === value ? ' todo-filter__btn--active' : ''}`}
                onClick={() => onFilterChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
}

export default TodoFilter
