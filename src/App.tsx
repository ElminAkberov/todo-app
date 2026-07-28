import { Component } from 'react'
// @ts-ignore
import './App.css'
import AddTodo from './components/AddTodo/AddTodo'
import TodoFilter from './components/TodoFilter/TodoFilter'
import TodoList from './components/TodoList/TodoList'
import { FilterType, Todo } from './types'

// TASK: Rewrite this class component as a functional component using hooks:
// - Replace state with useState (3 pieces: todos, filter, nextId)
// - Replace componentDidMount / componentDidUpdate with useEffect for localStorage sync
// - Replace class methods with regular const functions
// - Remove render(), return JSX directly

interface AppState {
  todos: Todo[]
  filter: FilterType
  nextId: number
}

class App extends Component<Record<string, never>, AppState> {
  constructor(props: Record<string, never>) {
    super(props)
    const saved: Todo[] = JSON.parse(localStorage.getItem('todos') ?? '[]')
    this.state = {
      todos: saved,
      filter: 'all',
      nextId: saved.length ? Math.max(...saved.map((t) => t.id)) + 1 : 1,
    }
  }

  componentDidUpdate(_prevProps: Record<string, never>, prevState: AppState) {
    if (prevState.todos !== this.state.todos) {
      localStorage.setItem('todos', JSON.stringify(this.state.todos))
    }
  }

  addTodo = (text: string) => {
    const { todos, nextId } = this.state
    const newTodo: Todo = { id: nextId, text: text.trim(), completed: false }
    this.setState({ todos: [...todos, newTodo], nextId: nextId + 1 })
  }

  toggleTodo = (id: number) => {
    this.setState((prev) => ({
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }))
  }

  deleteTodo = (id: number) => {
    this.setState((prev) => ({
      todos: prev.todos.filter((t) => t.id !== id),
    }))
  }

  editTodo = (id: number, newText: string) => {
    this.setState((prev) => ({
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, text: newText.trim() } : t
      ),
    }))
  }

  clearCompleted = () => {
    this.setState((prev) => ({
      todos: prev.todos.filter((t) => !t.completed),
    }))
  }

  setFilter = (filter: FilterType) => {
    this.setState({ filter })
  }

  getFilteredTodos(): Todo[] {
    const { todos, filter } = this.state
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed)
      case 'completed':
        return todos.filter((t) => t.completed)
      default:
        return todos
    }
  }

  render() {
    const { todos, filter } = this.state
    const filteredTodos = this.getFilteredTodos()
    const activeCount = todos.filter((t) => !t.completed).length

    return (
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">todos</h1>
        </header>

        <main className="app__main">
          <AddTodo onAdd={this.addTodo} />

          <TodoList
            todos={filteredTodos}
            onToggle={this.toggleTodo}
            onDelete={this.deleteTodo}
            onEdit={this.editTodo}
          />

          {todos.length > 0 && (
            <footer className="app__footer">
              <span className="app__count">
                {activeCount} item{activeCount !== 1 ? 's' : ''} left
              </span>
              <TodoFilter currentFilter={filter} onFilterChange={this.setFilter} />
              <button
                className="app__clear-btn"
                onClick={this.clearCompleted}
                disabled={activeCount === todos.length}
              >
                Clear completed
              </button>
            </footer>
          )}
        </main>
      </div>
    )
  }
}

export default App
