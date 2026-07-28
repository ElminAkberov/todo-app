import { renderHook, act } from '@testing-library/react'
import useTodoEdit from './useTodoEdit'

describe('useTodoEdit', () => {
  it('starts not editing', () => {
    const { result } = renderHook(() => useTodoEdit('text', vi.fn(), 1))
    expect(result.current.isEditing).toBe(false)
  })

  it('startEditing sets isEditing=true and fills editValue', () => {
    const { result } = renderHook(() => useTodoEdit('hello', vi.fn(), 1))
    act(() => result.current.startEditing())
    expect(result.current.isEditing).toBe(true)
    expect(result.current.editValue).toBe('hello')
  })

  it('cancelEdit sets isEditing=false', () => {
    const { result } = renderHook(() => useTodoEdit('hello', vi.fn(), 1))
    act(() => result.current.startEditing())
    act(() => result.current.cancelEdit())
    expect(result.current.isEditing).toBe(false)
  })

  it('submitEdit calls onEdit with trimmed value', () => {
    const onEdit = vi.fn()
    const { result } = renderHook(() => useTodoEdit('old', onEdit, 5))
    act(() => result.current.startEditing())
    act(() =>
      result.current.handleChange({
        target: { value: '  new text  ' },
      } as React.ChangeEvent<HTMLInputElement>)
    )
    act(() => result.current.submitEdit())
    expect(onEdit).toHaveBeenCalledWith(5, 'new text')
    expect(result.current.isEditing).toBe(false)
  })

  it('submitEdit does not call onEdit when value is empty', () => {
    const onEdit = vi.fn()
    const { result } = renderHook(() => useTodoEdit('old', onEdit, 1))
    act(() => result.current.startEditing())
    act(() =>
      result.current.handleChange({
        target: { value: '   ' },
      } as React.ChangeEvent<HTMLInputElement>)
    )
    act(() => result.current.submitEdit())
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('handleKeyDown Enter submits', () => {
    const onEdit = vi.fn()
    const { result } = renderHook(() => useTodoEdit('old', onEdit, 1))
    act(() => result.current.startEditing())
    act(() =>
      result.current.handleKeyDown({
        key: 'Enter',
      } as React.KeyboardEvent<HTMLInputElement>)
    )
    expect(onEdit).toHaveBeenCalled()
  })

  it('handleKeyDown Escape cancels', () => {
    const onEdit = vi.fn()
    const { result } = renderHook(() => useTodoEdit('old', onEdit, 1))
    act(() => result.current.startEditing())
    act(() =>
      result.current.handleKeyDown({
        key: 'Escape',
      } as React.KeyboardEvent<HTMLInputElement>)
    )
    expect(result.current.isEditing).toBe(false)
    expect(onEdit).not.toHaveBeenCalled()
  })
})
