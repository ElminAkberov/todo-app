import { renderHook, act } from '@testing-library/react'
import useTodoEdit from './useTodoEdit'

// EXERCISE: Fill in each test body using renderHook and act
// Hook signature: useTodoEdit(originalText: string, onEdit: fn, id: number)
// Returns: { isEditing, editValue, inputRef, startEditing, submitEdit,
//             cancelEdit, handleChange, handleKeyDown }

describe('useTodoEdit', () => {
  it('starts not editing', () => {
    // TODO: renderHook(() => useTodoEdit('text', vi.fn(), 1))
    // TODO: assert isEditing === false
  })

  it('startEditing sets isEditing=true and fills editValue', () => {
    // TODO: renderHook, call startEditing() inside act()
    // TODO: assert isEditing === true and editValue === 'hello'
  })

  it('cancelEdit sets isEditing=false', () => {
    // TODO: start editing, then cancelEdit() inside act()
    // TODO: assert isEditing === false
  })

  it('submitEdit calls onEdit with trimmed value', () => {
    // TODO: renderHook with a mock onEdit and id=5
    // TODO: startEditing, handleChange to '  new text  ', submitEdit
    // TODO: assert onEdit called with (5, 'new text') and isEditing false
  })

  it('submitEdit does not call onEdit when value is empty', () => {
    // TODO: startEditing, handleChange to '   ', submitEdit
    // TODO: assert onEdit was NOT called
  })

  it('handleKeyDown Enter submits', () => {
    // TODO: startEditing, handleKeyDown with key: 'Enter'
    // TODO: assert onEdit was called
  })

  it('handleKeyDown Escape cancels', () => {
    // TODO: startEditing, handleKeyDown with key: 'Escape'
    // TODO: assert isEditing false and onEdit NOT called
  })
})
