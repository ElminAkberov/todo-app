import React, { Component } from 'react'
import { Todo } from '../types'

// TASK: Rewrite this class component as a functional component using hooks:
// - state: { isEditing, editValue } → useState
// - handleDoubleClick, handleEditChange, handleEditSubmit, handleKeyDown become const functions
// - Remove render(), return JSX directly
// - Bonus: use useRef on the edit input and call .focus() inside useEffect when isEditing turns true

interface TodoItemProps {
  todo: Todo
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (id: number, text: string) => void
}

interface TodoItemState {
  isEditing: boolean
  editValue: string
}

class TodoItem extends Component<TodoItemProps, TodoItemState> {
  constructor(props: TodoItemProps) {
    super(props)
    this.state = {
      isEditing: false,
      editValue: '',
    }
  }

  handleDoubleClick = () => {
    this.setState({ isEditing: true, editValue: this.props.todo.text })
  }

  handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ editValue: e.target.value })
  }

  handleEditSubmit = () => {
    const trimmed = this.state.editValue.trim()
    if (trimmed) {
      this.props.onEdit(this.props.todo.id, trimmed)
    }
    this.setState({ isEditing: false })
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') this.handleEditSubmit()
    if (e.key === 'Escape') this.setState({ isEditing: false })
  }

  handleToggle = () => {
    this.props.onToggle(this.props.todo.id)
  }

  handleDelete = () => {
    this.props.onDelete(this.props.todo.id)
  }

  render() {
    const { todo } = this.props
    const { isEditing, editValue } = this.state

    return (
      <li className={`todo-item${todo.completed ? ' todo-item--completed' : ''}`}>
        <input
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={this.handleToggle}
        />

        {isEditing ? (
          <input
            className="todo-item__edit-input"
            type="text"
            value={editValue}
            onChange={this.handleEditChange}
            onBlur={this.handleEditSubmit}
            onKeyDown={this.handleKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="todo-item__text"
            onDoubleClick={this.handleDoubleClick}
            title="Double-click to edit"
          >
            {todo.text}
          </span>
        )}

        <button className="todo-item__delete-btn" onClick={this.handleDelete}>
          ✕
        </button>
      </li>
    )
  }
}

export default TodoItem
