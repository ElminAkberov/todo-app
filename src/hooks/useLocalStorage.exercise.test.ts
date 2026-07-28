import { renderHook, act } from '@testing-library/react'
import useLocalStorage from './useLocalStorage'

// EXERCISE: Fill in each test body using renderHook and act
// Hook signature: useLocalStorage<T>(key: string, initialValue: T)
// Returns: [value, setValue] — same shape as useState

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initialValue when localStorage is empty', () => {
    // TODO: renderHook(() => useLocalStorage('key', 42))
    // TODO: assert result.current[0] === 42
  })

  it('reads existing value from localStorage', () => {
    // TODO: set localStorage.setItem('key', JSON.stringify('hello'))
    // TODO: renderHook with key 'key' and default 'default'
    // TODO: assert result.current[0] === 'hello'
  })

  it('persists value to localStorage on update', () => {
    // TODO: renderHook with key 'key' and default 0
    // TODO: call result.current[1](99) inside act()
    // TODO: assert localStorage.getItem('key') === '99'
  })

  it('works with arrays', () => {
    // TODO: renderHook with an empty array default
    // TODO: set the value to [1, 2, 3] inside act()
    // TODO: assert result.current[0] deep equals [1, 2, 3]
    // TODO: assert localStorage value also deep equals [1, 2, 3]
  })

  it('supports functional updater', () => {
    // TODO: renderHook with default 0
    // TODO: call setValue(prev => prev + 1) inside act()
    // TODO: assert result.current[0] === 1
  })
})
