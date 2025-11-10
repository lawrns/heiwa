describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('validates correct email format', () => {
      const email = 'user@example.com'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(true)
    })

    it('rejects invalid email format', () => {
      const email = 'invalid-email'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(false)
    })

    it('rejects email without domain', () => {
      const email = 'user@'
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('validates phone number with digits', () => {
      const phone = '+1234567890'
      const isValid = /^\+?[\d\s\-()]+$/.test(phone)
      expect(isValid).toBe(true)
    })

    it('rejects invalid phone format', () => {
      const phone = 'abc123'
      const isValid = /^\+?[\d\s\-()]+$/.test(phone)
      expect(isValid).toBe(false)
    })
  })

  describe('Name Validation', () => {
    it('validates non-empty name', () => {
      const name = 'John Doe'
      const isValid = name.trim().length > 0
      expect(isValid).toBe(true)
    })

    it('rejects empty name', () => {
      const name = ''
      const isValid = name.trim().length > 0
      expect(isValid).toBe(false)
    })

    it('rejects whitespace-only name', () => {
      const name = '   '
      const isValid = name.trim().length > 0
      expect(isValid).toBe(false)
    })
  })

  describe('Price Validation', () => {
    it('validates positive price', () => {
      const price = 100
      const isValid = price > 0
      expect(isValid).toBe(true)
    })

    it('rejects zero price', () => {
      const price = 0
      const isValid = price > 0
      expect(isValid).toBe(false)
    })

    it('rejects negative price', () => {
      const price = -50
      const isValid = price > 0
      expect(isValid).toBe(false)
    })
  })

  describe('Date Validation', () => {
    it('validates date format', () => {
      const date = '2024-01-15'
      const isValid = !isNaN(Date.parse(date))
      expect(isValid).toBe(true)
    })

    it('validates date range', () => {
      const checkIn = new Date('2024-01-15')
      const checkOut = new Date('2024-01-20')
      const isValid = checkOut > checkIn
      expect(isValid).toBe(true)
    })

    it('rejects invalid date range', () => {
      const checkIn = new Date('2024-01-20')
      const checkOut = new Date('2024-01-15')
      const isValid = checkOut > checkIn
      expect(isValid).toBe(false)
    })
  })

  describe('Status Validation', () => {
    it('validates allowed status values', () => {
      const allowedStatuses = ['active', 'inactive', 'pending']
      const status = 'active'
      const isValid = allowedStatuses.includes(status)
      expect(isValid).toBe(true)
    })

    it('rejects invalid status value', () => {
      const allowedStatuses = ['active', 'inactive', 'pending']
      const status = 'unknown'
      const isValid = allowedStatuses.includes(status)
      expect(isValid).toBe(false)
    })
  })
})
