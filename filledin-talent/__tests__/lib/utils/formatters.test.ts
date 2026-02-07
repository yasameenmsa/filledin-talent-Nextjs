import { formatDate, formatCurrency } from '@/lib/utils/formatters'

describe('formatDate', () => {
  it('formats a valid Date object correctly', () => {
    const date = new Date('2024-01-15T10:30:00')
    const result = formatDate(date, 'en-US')
    expect(result).toBeTruthy()
    expect(result).toContain('2024')
    expect(result).toContain('Jan')
  })

  it('formats a valid date string correctly', () => {
    const result = formatDate('2024-01-15', 'en-US')
    expect(result).toBeTruthy()
  })

  it('formats a valid timestamp correctly', () => {
    const timestamp = new Date('2024-01-15').getTime()
    const result = formatDate(timestamp, 'en-US')
    expect(result).toBeTruthy()
  })

  it('returns empty string for null input', () => {
    const result = formatDate(null, 'en-US')
    expect(result).toBe('')
  })

  it('returns empty string for undefined input', () => {
    const result = formatDate(undefined, 'en-US')
    expect(result).toBe('')
  })

  it('returns empty string for invalid date', () => {
    const result = formatDate('invalid-date', 'en-US')
    expect(result).toBe('')
  })

  it('formats date in different locales', () => {
    const date = new Date('2024-01-15')
    const enResult = formatDate(date, 'en-US')
    const frResult = formatDate(date, 'fr-FR')
    expect(enResult).toBeTruthy()
    expect(frResult).toBeTruthy()
    // Results will differ by locale
    expect(enResult).not.toEqual(frResult)
  })
})

describe('formatCurrency', () => {
  it('formats a positive number correctly', () => {
    const result = formatCurrency(1234.56, 'en-US', 'USD')
    expect(result).toBe('$1,234.56')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'en-US', 'USD')
    expect(result).toBe('$0.00')
  })

  it('formats a large number correctly', () => {
    const result = formatCurrency(1000000, 'en-US', 'USD')
    expect(result).toBe('$1,000,000.00')
  })

  it('formats in different currencies', () => {
    const usdResult = formatCurrency(1000, 'en-US', 'USD')
    const eurResult = formatCurrency(1000, 'de-DE', 'EUR')
    expect(usdResult).toContain('$')
    expect(eurResult).toContain('€')
  })

  it('formats in different locales', () => {
    const usResult = formatCurrency(1000.50, 'en-US', 'USD')
    const deResult = formatCurrency(1000.50, 'de-DE', 'EUR')
    expect(usResult).toBe('$1,000.50')
    // German locale uses comma as decimal separator
    expect(deResult).toContain('1.000,50')
  })

  it('formats negative numbers correctly', () => {
    const result = formatCurrency(-500, 'en-US', 'USD')
    expect(result).toContain('-')
    expect(result).toContain('$500')
  })
})
