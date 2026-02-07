import { cn } from '@/lib/utils/cn'

describe('cn Utility Function', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
  })

  it('should handle undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should merge Tailwind classes correctly', () => {
    expect(cn('p-4 p-6')).toBe('p-6')
  })

  it('should handle conflicting classes', () => {
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle complex class combinations', () => {
    const result = cn(
      'px-4 py-2',
      'bg-blue-500',
      { 'bg-red-500': false, 'text-white': true },
      ['hover:bg-blue-600', undefined]
    )
    expect(result).toBe('px-4 py-2 bg-blue-500 text-white hover:bg-blue-600')
  })

  it('should remove duplicate classes', () => {
    expect(cn('foo bar', 'bar baz')).toBe('foo bar baz')
  })
})
