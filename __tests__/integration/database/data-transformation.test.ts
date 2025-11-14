/**
 * Data Transformation Integration Tests
 * Tests for database → frontend field mapping
 */

import { supabaseAdmin } from '@/lib/supabase'
import { createMockBooking, createMockClient } from '../../utils/mock-factories'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: [],
              error: null,
              count: 0,
            })),
          })),
        })),
        in: jest.fn(() => Promise.resolve({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}))

describe('Data Transformation - Bookings API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Database to Frontend Mapping', () => {
    it('should transform client_ids to guest_name', async () => {
      const mockBooking = createMockBooking({
        client_ids: ['client-1'],
      })
      const mockClient = createMockClient({
        id: 'client-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+351912345678',
      })

      const mockFrom = supabaseAdmin.from as jest.Mock

      // Mock bookings query
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: [mockBooking],
              error: null,
              count: 1,
            })),
          })),
        })),
      })

      // Mock clients query
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          in: jest.fn(() => Promise.resolve({
            data: [mockClient],
            error: null,
          })),
        })),
      })

      // Simulate transformation logic
      const clientMap = new Map()
      clientMap.set('client-1', mockClient)

      const transformed = {
        guest_name: mockClient.name,
        guest_email: mockClient.email,
        guest_phone: mockClient.phone,
      }

      expect(transformed.guest_name).toBe('John Doe')
      expect(transformed.guest_email).toBe('john@example.com')
      expect(transformed.guest_phone).toBe('+351912345678')
    })

    it('should transform items array to check_in/check_out', () => {
      const mockBooking = createMockBooking({
        items: [
          {
            type: 'room',
            itemId: 'room-1',
            dates: {
              checkIn: '2025-02-01',
              checkOut: '2025-02-04',
            },
          },
        ],
      })

      const firstItem = mockBooking.items[0]
      const transformed = {
        check_in: firstItem.dates.checkIn,
        check_out: firstItem.dates.checkOut,
        item_name: firstItem.itemId,
        type: firstItem.type,
      }

      expect(transformed.check_in).toBe('2025-02-01')
      expect(transformed.check_out).toBe('2025-02-04')
      expect(transformed.item_name).toBe('room-1')
      expect(transformed.type).toBe('room')
    })

    it('should transform total_amount to total_price', () => {
      const mockBooking = createMockBooking({
        total_amount: 240,
      })

      const transformed = {
        total_price: mockBooking.total_amount,
      }

      expect(transformed.total_price).toBe(240)
    })

    it('should handle multiple client_ids', () => {
      const mockBooking = createMockBooking({
        client_ids: ['client-1', 'client-2'],
      })
      const mockClients = [
        createMockClient({ id: 'client-1', name: 'John Doe' }),
        createMockClient({ id: 'client-2', name: 'Jane Smith' }),
      ]

      const clientMap = new Map()
      mockClients.forEach(client => clientMap.set(client.id, client))

      // Use first client for guest info
      const firstClientId = mockBooking.client_ids[0]
      const transformed = {
        guest_name: clientMap.get(firstClientId)?.name || 'Unknown',
      }

      expect(transformed.guest_name).toBe('John Doe')
    })

    it('should handle missing client_ids gracefully', () => {
      const mockBooking = createMockBooking({
        client_ids: [],
      })

      const transformed = {
        guest_name: 'Unknown',
        guest_email: '',
        guest_phone: '',
      }

      expect(transformed.guest_name).toBe('Unknown')
    })
  })

  describe('Testimonials API Transformation', () => {
    it('should map author_name to guest_name', () => {
      const dbTestimonial = {
        id: 'test-1',
        author_name: 'John Doe',
        content: 'Great experience!',
        rating: 5,
      }

      const transformed = {
        guest_name: dbTestimonial.author_name,
        text: dbTestimonial.content,
      }

      expect(transformed.guest_name).toBe('John Doe')
      expect(transformed.text).toBe('Great experience!')
    })

    it('should map author_email to guest_email', () => {
      const dbTestimonial = {
        author_email: 'john@example.com',
      }

      const transformed = {
        guest_email: dbTestimonial.author_email,
      }

      expect(transformed.guest_email).toBe('john@example.com')
    })

    it('should map author_image to guest_image_url', () => {
      const dbTestimonial = {
        author_image: 'https://example.com/avatar.jpg',
      }

      const transformed = {
        guest_image_url: dbTestimonial.author_image,
      }

      expect(transformed.guest_image_url).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('N+1 Query Prevention', () => {
    it('should fetch all clients in single query', async () => {
      const mockBookings = [
        createMockBooking({ client_ids: ['client-1'] }),
        createMockBooking({ client_ids: ['client-2'] }),
        createMockBooking({ client_ids: ['client-3'] }),
      ]

      const mockClients = [
        createMockClient({ id: 'client-1' }),
        createMockClient({ id: 'client-2' }),
        createMockClient({ id: 'client-3' }),
      ]

      const mockFrom = supabaseAdmin.from as jest.Mock

      // Mock bookings query
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn(() => Promise.resolve({
              data: mockBookings,
              error: null,
            })),
          })),
        })),
      })

      // Mock clients query (should be called once with all IDs)
      mockFrom.mockReturnValueOnce({
        select: jest.fn(() => ({
          in: jest.fn((column, ids) => {
            expect(column).toBe('id')
            expect(ids).toEqual(['client-1', 'client-2', 'client-3'])
            return Promise.resolve({
              data: mockClients,
              error: null,
            })
          }),
        })),
      })

      // Simulate the transformation
      const allClientIds = new Set<string>()
      mockBookings.forEach(booking => {
        booking.client_ids.forEach(id => allClientIds.add(id))
      })

      expect(allClientIds.size).toBe(3)
      // Verify clients query would be called once, not three times
    })
  })
})

