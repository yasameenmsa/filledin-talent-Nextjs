import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useToast } from '@/hooks/use-toast'

describe('useToast Hook', () => {
  it('should return empty toasts array initially', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toEqual([])
  })

  it('should have toast function', () => {
    const { result } = renderHook(() => useToast())
    expect(typeof result.current.toast).toBe('function')
  })

  it('should have dismiss function', () => {
    const { result } = renderHook(() => useToast())
    expect(typeof result.current.dismiss).toBe('function')
  })

  it('should create a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      const toastResult = result.current.toast({
        title: 'Test Toast',
        description: 'Test Description',
      })
      expect(toastResult).toHaveProperty('id')
      expect(toastResult).toHaveProperty('dismiss')
      expect(toastResult).toHaveProperty('update')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].title).toBe('Test Toast')
  })

  it('should dismiss toast when dismiss is called', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      const toastResult = result.current.toast({
        title: 'Test Toast',
      })
      // Dismiss the toast
      toastResult.dismiss()
    })

    // After dismissal, toast should still exist but with open: false
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].open).toBe(false)
  })

  it('should limit number of toasts', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.toast({ title: 'Toast 1' })
      result.current.toast({ title: 'Toast 2' })
    })

    // TOAST_LIMIT is 1, so only 1 toast should exist
    expect(result.current.toasts).toHaveLength(1)
  })
})
