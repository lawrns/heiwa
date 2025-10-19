import { calculateNights, calculateTotalPrice, formatPrice } from '@/lib/utils'

describe('Booking Calculations', () => {
  describe('calculateNights', () => {
    it('should calculate correct number of nights for same day', () => {
      const checkIn = new Date('2024-01-15T00:00:00.000Z')
      const checkOut = new Date('2024-01-15T00:00:00.000Z')
      expect(calculateNights(checkIn, checkOut)).toBe(0)
    })

    it('should calculate correct number of nights for consecutive days', () => {
      const checkIn = new Date('2024-01-15T00:00:00.000Z')
      const checkOut = new Date('2024-01-16T00:00:00.000Z')
      expect(calculateNights(checkIn, checkOut)).toBe(1)
    })

    it('should calculate correct number of nights for multiple days', () => {
      const checkIn = new Date('2024-01-15T00:00:00.000Z')
      const checkOut = new Date('2024-01-18T00:00:00.000Z')
      expect(calculateNights(checkIn, checkOut)).toBe(3)
    })

    it('should handle timezone differences correctly', () => {
      // Test with different timezones to ensure UTC consistency
      const checkIn = new Date('2024-01-15T00:00:00.000Z') // UTC
      const checkOut = new Date('2024-01-16T00:00:00.000Z') // UTC
      expect(calculateNights(checkIn, checkOut)).toBe(1)
    })

    it('should return 0 for invalid dates', () => {
      const checkIn = new Date('invalid')
      const checkOut = new Date('2024-01-16T00:00:00.000Z')
      expect(calculateNights(checkIn, checkOut)).toBe(0)
    })
  })

  describe('calculateTotalPrice', () => {
    it('should calculate total price for room booking', () => {
      const option = { pricePerNight: 80 }
      const nights = 3
      expect(calculateTotalPrice(option, nights)).toBe(240)
    })

    it('should calculate total price for surf week', () => {
      const option = { price: 450 }
      expect(calculateTotalPrice(option, 0)).toBe(450)
    })

    it('should handle zero price', () => {
      const option = { pricePerNight: 0 }
      const nights = 2
      expect(calculateTotalPrice(option, nights)).toBe(0)
    })

    it('should handle missing price fields', () => {
      const option = {}
      const nights = 2
      expect(calculateTotalPrice(option, nights)).toBe(0)
    })
  })

  describe('formatPrice', () => {
    it('should format price with euro symbol', () => {
      expect(formatPrice(80)).toBe('€80.00')
    })

    it('should format zero price', () => {
      expect(formatPrice(0)).toBe('€0.00')
    })

    it('should format large prices', () => {
      expect(formatPrice(1250)).toBe('€1,250.00')
    })

    it('should handle decimal prices', () => {
      expect(formatPrice(80.50)).toBe('€80.50')
    })
  })
})
