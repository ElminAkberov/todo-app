import { renderHook, act } from '@testing-library/react'
import useLocalStorage from './useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initialValue when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('key', 42))
    expect(result.current[0]).toBe(42)
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('key', JSON.stringify('hello'))
    const { result } = renderHook(() => useLocalStorage('key', 'default'))
    expect(result.current[0]).toBe('hello')
  })

  it('persists value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0))
    act(() => result.current[1](99))
    expect(localStorage.getItem('key')).toBe('99')
  })

  it('works with arrays', () => {
    const { result } = renderHook(() => useLocalStorage<number[]>('arr', []))
    act(() => result.current[1]([1, 2, 3]))
    expect(result.current[0]).toEqual([1, 2, 3])
    expect(JSON.parse(localStorage.getItem('arr')!)).toEqual([1, 2, 3])
  })

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0))
    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(1)
  })
})
