import React, { Component } from 'react'

const MAX_LENGTH = 100

// TASK: Rewrite this class component as a functional component using hooks:
// - state: { value, error } → two useState calls (or one with an object)
// - handleChange and handleSubmit become regular const functions
// - Remove render(), return JSX directly
// - Note: error should reset when the user starts typing again

interface AddTodoProps {
  onAdd: (text: string) => void
}

interface AddTodoState {
  value: string
  error: string | null
}

class AddTodo extends Component<AddTodoProps, AddTodoState> {
  constructor(props: AddTodoProps) {
    super(props)
    this.state = {
      value: '',
      error: null,
    }
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ value: e.target.value, error: null })
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { value } = this.state
    const trimmed = value.trim()

    if (!trimmed) {
      this.setState({ error: 'Task cannot be empty.' })
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      this.setState({ error: `Max ${MAX_LENGTH} characters.` })
      return
    }

    this.props.onAdd(trimmed)
    this.setState({ value: '', error: null })
  }

  render() {
    const { value, error } = this.state
    const remaining = MAX_LENGTH - value.length
    const isOverLimit = remaining < 0

    return (
      <div className="add-todo-wrapper">
        <form className="add-todo" onSubmit={this.handleSubmit}>
          <input
            className={`add-todo__input${error ? ' add-todo__input--error' : ''}`}
            type="text"
            value={value}
            onChange={this.handleChange}
            placeholder="What needs to be done?"
            autoFocus
          />
          <button className="add-todo__btn" type="submit">
            Add
          </button>
        </form>

        <div className="add-todo__meta">
          {error ? (
            <span className="add-todo__error">{error}</span>
          ) : (
            <span className={`add-todo__counter${isOverLimit ? ' add-todo__counter--over' : ''}`}>
              {remaining} chars left
            </span>
          )}
        </div>
      </div>
    )
  }
}

export default AddTodo
