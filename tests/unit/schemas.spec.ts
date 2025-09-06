import { z } from 'zod'

// Mock schemas - these would be imported from @/lib/schemas
const ClientProfileSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  location: z.string().optional(),
  surf_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  emergency_contact: z.string().optional(),
  emergency_phone: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  medical_conditions: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const BookingSchema = z.object({
  id: z.string().optional(),
  client_ids: z.array(z.string()).min(1, 'At least one client required'),
  items: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['room', 'surfCamp']),
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be non-negative'),
    totalPrice: z.number().min(0, 'Total price must be non-negative'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })).min(1, 'At least one item required'),
  total_amount: z.number().min(0, 'Total amount must be non-negative'),
  payment_status: z.enum(['pending', 'confirmed', 'cancelled']),
  payment_method: z.enum(['stripe', 'cash', 'bank_transfer']).optional(),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const RoomSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Room name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity too high'),
  amenities: z.array(z.string()).optional(),
  pricing: z.object({
    basePrice: z.number().min(0, 'Base price must be non-negative'),
    weekendSurcharge: z.number().min(0, 'Weekend surcharge must be non-negative').optional(),
    seasonalRates: z.object({
      high: z.number().min(0).optional(),
      medium: z.number().min(0).optional(),
      low: z.number().min(0).optional(),
    }).optional(),
  }),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const SurfCampSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Camp name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().int().min(1, 'Duration must be at least 1 day').max(30, 'Duration too long'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(50, 'Capacity too high'),
  price: z.number().min(0, 'Price must be non-negative'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  equipment: z.array(z.string()).optional(),
  linkedRooms: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'full']).default('active'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

const PaymentSchema = z.object({
  id: z.string().optional(),
  booking_id: z.string().min(1, 'Booking ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded', 'disputed']),
  payment_method: z.enum(['stripe', 'cash', 'bank_transfer']),
  stripe_payment_intent_id: z.string().optional(),
  stripe_checkout_session_id: z.string().optional(),
  refund_amount: z.number().min(0).optional(),
  refund_status: z.enum(['pending', 'completed', 'failed']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

describe('Schema Validation', () => {
  describe('ClientProfileSchema', () => {
    test('should validate valid client profile', () => {
      const validProfile = {
        user_id: 'user_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        surf_level: 'intermediate' as const,
      }

      const result = ClientProfileSchema.safeParse(validProfile)
      expect(result.success).toBe(true)
    })

    test('should reject invalid email', () => {
      const invalidProfile = {
        user_id: 'user_123',
        name: 'John Doe',
        email: 'invalid-email',
      }

      const result = ClientProfileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    test('should reject missing required fields', () => {
      const incompleteProfile = {
        name: 'John Doe',
        // Missing user_id and email
      }

      const result = ClientProfileSchema.safeParse(incompleteProfile)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(2) // user_id and email missing
      }
    })

    test('should validate surf level enum', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced']
      
      validLevels.forEach(level => {
        const profile = {
          user_id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
          surf_level: level,
        }
        
        const result = ClientProfileSchema.safeParse(profile)
        expect(result.success).toBe(true)
      })

      // Test invalid level
      const invalidProfile = {
        user_id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
        surf_level: 'expert', // Invalid level
      }

      const result = ClientProfileSchema.safeParse(invalidProfile)
      expect(result.success).toBe(false)
    })

    test('should handle optional fields', () => {
      const minimalProfile = {
        user_id: 'user_123',
        name: 'John Doe',
        email: 'john@example.com',
      }

      const result = ClientProfileSchema.safeParse(minimalProfile)
      expect(result.success).toBe(true)
    })
  })

  describe('BookingSchema', () => {
    test('should validate valid booking', () => {
      const validBooking = {
        client_ids: ['client_123'],
        items: [{
          type: 'room' as const,
          itemId: 'room_001',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 250,
        }],
        total_amount: 250,
        payment_status: 'pending' as const,
      }

      const result = BookingSchema.safeParse(validBooking)
      expect(result.success).toBe(true)
    })

    test('should reject empty client_ids array', () => {
      const invalidBooking = {
        client_ids: [],
        items: [{
          type: 'room' as const,
          itemId: 'room_001',
          quantity: 1,
          unitPrice: 250,
          totalPrice: 250,
        }],
        total_amount: 250,
        payment_status: 'pending' as const,
      }

      const result = BookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
    })

    test('should reject empty items array', () => {
      const invalidBooking = {
        client_ids: ['client_123'],
        items: [],
        total_amount: 250,
        payment_status: 'pending' as const,
      }

      const result = BookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
    })

    test('should validate item types', () => {
      const validTypes = ['room', 'surfCamp']
      
      validTypes.forEach(type => {
        const booking = {
          client_ids: ['client_123'],
          items: [{
            type: type as 'room' | 'surfCamp',
            itemId: 'item_001',
            quantity: 1,
            unitPrice: 250,
            totalPrice: 250,
          }],
          total_amount: 250,
          payment_status: 'pending' as const,
        }
        
        const result = BookingSchema.safeParse(booking)
        expect(result.success).toBe(true)
      })
    })

    test('should reject negative prices', () => {
      const invalidBooking = {
        client_ids: ['client_123'],
        items: [{
          type: 'room' as const,
          itemId: 'room_001',
          quantity: 1,
          unitPrice: -100, // Negative price
          totalPrice: 250,
        }],
        total_amount: 250,
        payment_status: 'pending' as const,
      }

      const result = BookingSchema.safeParse(invalidBooking)
      expect(result.success).toBe(false)
    })
  })

  describe('RoomSchema', () => {
    test('should validate valid room', () => {
      const validRoom = {
        name: 'Ocean View Suite',
        description: 'Beautiful suite with ocean views',
        capacity: 2,
        pricing: {
          basePrice: 250,
          weekendSurcharge: 50,
        },
        amenities: ['WiFi', 'Air Conditioning'],
        status: 'active' as const,
      }

      const result = RoomSchema.safeParse(validRoom)
      expect(result.success).toBe(true)
    })

    test('should reject invalid capacity', () => {
      const invalidRoom = {
        name: 'Test Room',
        description: 'Test description',
        capacity: 0, // Invalid capacity
        pricing: { basePrice: 100 },
      }

      const result = RoomSchema.safeParse(invalidRoom)
      expect(result.success).toBe(false)
    })

    test('should validate pricing structure', () => {
      const roomWithComplexPricing = {
        name: 'Premium Suite',
        description: 'Luxury accommodation',
        capacity: 4,
        pricing: {
          basePrice: 400,
          weekendSurcharge: 100,
          seasonalRates: {
            high: 500,
            medium: 400,
            low: 300,
          },
        },
      }

      const result = RoomSchema.safeParse(roomWithComplexPricing)
      expect(result.success).toBe(true)
    })

    test('should validate image URLs', () => {
      const roomWithImages = {
        name: 'Test Room',
        description: 'Test description',
        capacity: 2,
        pricing: { basePrice: 200 },
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      }

      const result = RoomSchema.safeParse(roomWithImages)
      expect(result.success).toBe(true)

      // Test invalid URLs
      const roomWithInvalidImages = {
        ...roomWithImages,
        images: ['not-a-url', 'also-not-a-url'],
      }

      const invalidResult = RoomSchema.safeParse(roomWithInvalidImages)
      expect(invalidResult.success).toBe(false)
    })
  })

  describe('SurfCampSchema', () => {
    test('should validate valid surf camp', () => {
      const validCamp = {
        name: 'Beginner Paradise',
        description: 'Perfect for first-time surfers',
        level: 'beginner' as const,
        duration: 7,
        capacity: 12,
        price: 450,
        startDate: '2024-03-15',
        endDate: '2024-03-21',
        instructor: 'Carlos Rodriguez',
        equipment: ['Surfboard', 'Wetsuit'],
      }

      const result = SurfCampSchema.safeParse(validCamp)
      expect(result.success).toBe(true)
    })

    test('should validate skill levels', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced']
      
      validLevels.forEach(level => {
        const camp = {
          name: 'Test Camp',
          description: 'Test description',
          level: level as 'beginner' | 'intermediate' | 'advanced',
          duration: 5,
          capacity: 10,
          price: 300,
          startDate: '2024-03-15',
          endDate: '2024-03-20',
          instructor: 'Test Instructor',
        }
        
        const result = SurfCampSchema.safeParse(camp)
        expect(result.success).toBe(true)
      })
    })

    test('should reject invalid duration', () => {
      const invalidCamp = {
        name: 'Test Camp',
        description: 'Test description',
        level: 'beginner' as const,
        duration: 0, // Invalid duration
        capacity: 10,
        price: 300,
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        instructor: 'Test Instructor',
      }

      const result = SurfCampSchema.safeParse(invalidCamp)
      expect(result.success).toBe(false)
    })

    test('should reject excessive capacity', () => {
      const invalidCamp = {
        name: 'Test Camp',
        description: 'Test description',
        level: 'beginner' as const,
        duration: 7,
        capacity: 100, // Too high
        price: 300,
        startDate: '2024-03-15',
        endDate: '2024-03-20',
        instructor: 'Test Instructor',
      }

      const result = SurfCampSchema.safeParse(invalidCamp)
      expect(result.success).toBe(false)
    })
  })

  describe('PaymentSchema', () => {
    test('should validate valid payment', () => {
      const validPayment = {
        booking_id: 'booking_123',
        amount: 450,
        currency: 'USD',
        status: 'completed' as const,
        payment_method: 'stripe' as const,
        stripe_payment_intent_id: 'pi_test_123',
      }

      const result = PaymentSchema.safeParse(validPayment)
      expect(result.success).toBe(true)
    })

    test('should validate currency format', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP']
      
      validCurrencies.forEach(currency => {
        const payment = {
          booking_id: 'booking_123',
          amount: 100,
          currency,
          status: 'pending' as const,
          payment_method: 'stripe' as const,
        }
        
        const result = PaymentSchema.safeParse(payment)
        expect(result.success).toBe(true)
      })

      // Test invalid currency
      const invalidPayment = {
        booking_id: 'booking_123',
        amount: 100,
        currency: 'INVALID', // Too long
        status: 'pending' as const,
        payment_method: 'stripe' as const,
      }

      const result = PaymentSchema.safeParse(invalidPayment)
      expect(result.success).toBe(false)
    })

    test('should validate payment statuses', () => {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'disputed']
      
      validStatuses.forEach(status => {
        const payment = {
          booking_id: 'booking_123',
          amount: 100,
          status: status as any,
          payment_method: 'stripe' as const,
        }
        
        const result = PaymentSchema.safeParse(payment)
        expect(result.success).toBe(true)
      })
    })

    test('should reject negative amounts', () => {
      const invalidPayment = {
        booking_id: 'booking_123',
        amount: -100, // Negative amount
        status: 'pending' as const,
        payment_method: 'stripe' as const,
      }

      const result = PaymentSchema.safeParse(invalidPayment)
      expect(result.success).toBe(false)
    })
  })

  describe('Schema edge cases', () => {
    test('should handle empty strings appropriately', () => {
      const profileWithEmptyName = {
        user_id: 'user_123',
        name: '', // Empty string
        email: 'test@example.com',
      }

      const result = ClientProfileSchema.safeParse(profileWithEmptyName)
      expect(result.success).toBe(false)
    })

    test('should handle very long strings', () => {
      const longName = 'a'.repeat(200) // Very long name
      const profileWithLongName = {
        user_id: 'user_123',
        name: longName,
        email: 'test@example.com',
      }

      const result = ClientProfileSchema.safeParse(profileWithLongName)
      expect(result.success).toBe(false)
    })

    test('should handle boundary values', () => {
      // Test minimum capacity
      const roomMinCapacity = {
        name: 'Single Room',
        description: 'Minimal room',
        capacity: 1, // Minimum allowed
        pricing: { basePrice: 100 },
      }

      expect(RoomSchema.safeParse(roomMinCapacity).success).toBe(true)

      // Test maximum capacity
      const roomMaxCapacity = {
        name: 'Large Room',
        description: 'Maximum capacity room',
        capacity: 10, // Maximum allowed
        pricing: { basePrice: 500 },
      }

      expect(RoomSchema.safeParse(roomMaxCapacity).success).toBe(true)
    })
  })
})
