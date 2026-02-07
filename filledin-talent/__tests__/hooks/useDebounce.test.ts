import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500))
    expect(result.current).toBe('test')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 500),
      { initialProps: 'initial' }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender('updated')
    expect(result.current).toBe('initial') // Still initial after update

    // Fast-forward past delay
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('should reset delay on rapid updates', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 500),
      { initialProps: 'initial' }
    )

    // First update
    rerender('value1')
    act(() => {
      jest.advanceTimersByTime(250)
    })

    // Second update before delay completes
    rerender('value2')
    act(() => {
      jest.advanceTimersByTime(250)
    })

    // Should still be initial (not enough time since last update)
    expect(result.current).toBe('initial')

    // Fast-forward past delay
    act(() => {
      jest.advanceTimersByTime(250)
    })

    expect(result.current).toBe('value2')
  })

  it('should handle 0 delay', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 0),
      { initialProps: 'initial' }
    )

    rerender('updated')
    act(() => {
      jest.runAllTimers()
    })

    expect(result.current).toBe('updated')
  })

  it('should handle empty string', () => {
    const { result } = renderHook(() => useDebounce('', 500))
    expect(result.current).toBe('')
  })
})
