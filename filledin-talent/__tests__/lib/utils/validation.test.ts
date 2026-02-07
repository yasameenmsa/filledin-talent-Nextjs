import { CharacterEncodingUtils } from '@/lib/utils/validation'

// Mock the getServerTranslation function
jest.mock('@/lib/i18n/serverTranslation', () => ({
  getServerTranslation: jest.fn(() => ({
    error: 'Error message',
  })),
}))

describe('CharacterEncodingUtils', () => {
  describe('normalizeText', () => {
    it('should normalize Unicode text', () => {
      const result = CharacterEncodingUtils.normalizeText('café')
      expect(result).toBe('café')
    })

    it('should handle empty string', () => {
      const result = CharacterEncodingUtils.normalizeText('')
      expect(result).toBe('')
    })

    it('should handle strings with combining characters', () => {
      const result = CharacterEncodingUtils.normalizeText('é')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('isValidUTF8', () => {
    it('should return true for valid UTF-8 text', () => {
      expect(CharacterEncodingUtils.isValidUTF8('Hello')).toBe(true)
      expect(CharacterEncodingUtils.isValidUTF8('café')).toBe(true)
      expect(CharacterEncodingUtils.isValidUTF8('مرحبا')).toBe(true)
    })

    it('should return true for empty string', () => {
      expect(CharacterEncodingUtils.isValidUTF8('')).toBe(true)
    })

    it('should handle various Unicode characters', () => {
      expect(CharacterEncodingUtils.isValidUTF8('日本語')).toBe(true)
      expect(CharacterEncodingUtils.isValidUTF8('한국어')).toBe(true)
      expect(CharacterEncodingUtils.isValidUTF8('العربية')).toBe(true)
    })
  })

  describe('sanitizeText', () => {
    it('should remove control characters', () => {
      const input = 'Hello\u0000World\u001F'
      const result = CharacterEncodingUtils.sanitizeText(input)
      expect(result).toBe('HelloWorld')
    })

    it('should trim whitespace', () => {
      const result = CharacterEncodingUtils.sanitizeText('  hello  ')
      expect(result).toBe('hello')
    })

    it('should preserve valid UTF-8 characters', () => {
      const result = CharacterEncodingUtils.sanitizeText('café 日本語')
      expect(result).toBe('café 日本語')
    })

    it('should handle empty string', () => {
      const result = CharacterEncodingUtils.sanitizeText('')
      expect(result).toBe('')
    })

    it('should handle string with only control characters', () => {
      const result = CharacterEncodingUtils.sanitizeText('\u0000\u001F\u009F')
      expect(result).toBe('')
    })
  })

  describe('containsRTL', () => {
    it('should return true for Arabic text', () => {
      expect(CharacterEncodingUtils.containsRTL('مرحبا')).toBe(true)
      expect(CharacterEncodingUtils.containsRTL('العربية')).toBe(true)
    })

    it('should return true for Hebrew text', () => {
      expect(CharacterEncodingUtils.containsRTL('שלום')).toBe(true)
    })

    it('should return false for LTR text', () => {
      expect(CharacterEncodingUtils.containsRTL('Hello')).toBe(false)
      expect(CharacterEncodingUtils.containsRTL('café')).toBe(false)
    })

    it('should return true for mixed RTL/LTR text', () => {
      expect(CharacterEncodingUtils.containsRTL('Hello مرحبا')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(CharacterEncodingUtils.containsRTL('')).toBe(false)
    })

    it('should return false for numbers', () => {
      expect(CharacterEncodingUtils.containsRTL('12345')).toBe(false)
    })
  })
})
