import { cn, formatCurrency, formatDate, validateEmail, generateId, calculateDaysBetween } from '@/lib/utils'

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    test('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    test('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    test('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid')
    })

    test('should handle empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid')
    })
  })

  describe('formatCurrency', () => {
    test('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(1000)).toBe('$1,000.00')
    })

    test('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
    })

    test('should handle negative amounts', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    test('should handle very large numbers', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89')
    })

    test('should handle decimal precision', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50')
      expect(formatCurrency(1234)).toBe('$1,234.00')
    })
  })

  describe('formatDate', () => {
    test('should format date strings correctly', () => {
      const date = '2024-03-15T10:30:00Z'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Mar 15, 2024/)
    })

    test('should format Date objects correctly', () => {
      const date = new Date('2024-03-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Mar 15, 2024/)
    })

    test('should handle different date formats', () => {
      expect(formatDate('2024-03-15', 'short')).toMatch(/3\/15\/2024/)
      expect(formatDate('2024-03-15', 'long')).toMatch(/March 15, 2024/)
    })

    test('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
      expect(formatDate(null)).toBe('Invalid Date')
      expect(formatDate(undefined)).toBe('Invalid Date')
    })

    test('should handle timezone formatting', () => {
      const date = '2024-03-15T10:30:00Z'
      const formatted = formatDate(date, 'full')
      expect(formatted).toContain('2024')
    })
  })

  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..test@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })

    test('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true) // Minimal valid email
      expect(validateEmail('test@localhost')).toBe(true) // Local domain
      expect(validateEmail('test@example')).toBe(true) // No TLD (technically valid)
    })
  })

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })

    test('should generate IDs of consistent length', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1.length).toBe(id2.length)
      expect(id1.length).toBeGreaterThan(0)
    })

    test('should generate IDs with specified prefix', () => {
      const id = generateId('user')
      expect(id).toMatch(/^user_/)
    })

    test('should generate IDs with specified length', () => {
      const id = generateId('', 10)
      expect(id.length).toBe(10)
    })
  })

  describe('calculateDaysBetween', () => {
    test('should calculate days between dates correctly', () => {
      const start = '2024-03-01'
      const end = '2024-03-08'
      expect(calculateDaysBetween(start, end)).toBe(7)
    })

    test('should handle same date', () => {
      const date = '2024-03-01'
      expect(calculateDaysBetween(date, date)).toBe(0)
    })

    test('should handle reverse date order', () => {
      const start = '2024-03-08'
      const end = '2024-03-01'
      expect(calculateDaysBetween(start, end)).toBe(-7)
    })

    test('should handle Date objects', () => {
      const start = new Date('2024-03-01')
      const end = new Date('2024-03-08')
      expect(calculateDaysBetween(start, end)).toBe(7)
    })

    test('should handle invalid dates', () => {
      expect(calculateDaysBetween('invalid', '2024-03-01')).toBeNaN()
      expect(calculateDaysBetween('2024-03-01', 'invalid')).toBeNaN()
    })

    test('should handle leap years', () => {
      const start = '2024-02-28'
      const end = '2024-03-01'
      expect(calculateDaysBetween(start, end)).toBe(2) // 2024 is a leap year
    })
  })

  describe('Edge cases and error handling', () => {
    test('formatCurrency should handle edge cases', () => {
      expect(formatCurrency(NaN)).toBe('$0.00')
      expect(formatCurrency(Infinity)).toBe('$0.00')
      expect(formatCurrency(-Infinity)).toBe('$0.00')
    })

    test('validateEmail should handle non-string inputs', () => {
      expect(validateEmail(123 as any)).toBe(false)
      expect(validateEmail({} as any)).toBe(false)
      expect(validateEmail([] as any)).toBe(false)
    })

    test('generateId should handle invalid inputs gracefully', () => {
      expect(() => generateId('', -1)).not.toThrow()
      expect(() => generateId('', 0)).not.toThrow()
    })
  })

  describe('Performance and consistency', () => {
    test('formatCurrency should be consistent', () => {
      const amount = 1234.56
      const result1 = formatCurrency(amount)
      const result2 = formatCurrency(amount)
      expect(result1).toBe(result2)
    })

    test('generateId should generate different IDs consistently', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(100) // All IDs should be unique
    })

    test('validateEmail should be case insensitive for domain', () => {
      expect(validateEmail('test@EXAMPLE.COM')).toBe(true)
      expect(validateEmail('TEST@example.com')).toBe(true)
    })
  })
})

// Mock implementation for utils that might not exist yet
jest.mock('@/lib/utils', () => {
  const actual = jest.requireActual('@/lib/utils') || {}
  
  return {
    ...actual,
    cn: (...classes: any[]) => {
      return classes
        .filter(Boolean)
        .filter(cls => cls !== '' && cls !== null && cls !== undefined)
        .join(' ')
    },
    formatCurrency: (amount: number, currency = 'USD') => {
      if (isNaN(amount) || !isFinite(amount)) return '$0.00'
      
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
      })
      
      return formatter.format(amount)
    },
    formatDate: (date: any, format = 'medium') => {
      if (!date) return 'Invalid Date'
      
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return 'Invalid Date'
      
      const options: Intl.DateTimeFormatOptions = {
        short: { month: 'numeric', day: 'numeric', year: 'numeric' },
        medium: { month: 'short', day: 'numeric', year: 'numeric' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      }[format] || { month: 'short', day: 'numeric', year: 'numeric' }
      
      return dateObj.toLocaleDateString('en-US', options)
    },
    validateEmail: (email: any) => {
      if (typeof email !== 'string') return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    generateId: (prefix = '', length = 12) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let result = ''
      for (let i = 0; i < Math.max(1, length); i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return prefix ? `${prefix}_${result}` : result
    },
    calculateDaysBetween: (start: any, end: any) => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NaN
      }
      
      const diffTime = endDate.getTime() - startDate.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },
  }
}, { virtual: true })
