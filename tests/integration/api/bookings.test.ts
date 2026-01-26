/**
 * Bookings API Integration Tests
 * Tests for POST /api/bookings and GET /api/bookings endpoints
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/bookings/route';

// Mock the booking service
jest.mock('@/lib/services/booking.service', () => ({
  bookingService: {
    getBookings: jest.fn(),
    createSurfWeekBooking: jest.fn(),
    createRoomBooking: jest.fn(),
  },
}));

// Mock admin auth
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(() => null), // Return null = authenticated
}));

// Mock email service (dynamic import)
jest.mock('@/lib/email-service', () => ({
  emailService: {
    sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
    sendBookingNotificationToAdmin: jest.fn().mockResolvedValue(undefined),
  },
}));

import { bookingService } from '@/lib/services/booking.service';
import { requireAdminAuth } from '@/lib/admin-auth';

const mockBookingService = bookingService as jest.Mocked<typeof bookingService>;
const mockRequireAdminAuth = requireAdminAuth as jest.MockedFunction<typeof requireAdminAuth>;

// Helper to create mock NextRequest
function createMockRequest(
  method: string,
  url: string,
  body?: object
): NextRequest {
  const request = new NextRequest(new URL(url, 'http://localhost:3000'), {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

describe('Bookings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminAuth.mockReturnValue(null);
  });

  // ==========================================================================
  // GET /api/bookings
  // ==========================================================================

  describe('GET /api/bookings', () => {
    it('should return bookings list with success response', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          booking_number: 'HW-ABC123',
          status: 'confirmed',
          start_date: '2024-01-15',
          end_date: '2024-01-20',
        },
        {
          id: 'booking-2',
          booking_number: 'HW-DEF456',
          status: 'pending',
          start_date: '2024-02-01',
          end_date: '2024-02-05',
        },
      ];

      mockBookingService.getBookings.mockResolvedValue({
        bookings: mockBookings,
        total: 2,
      });

      const request = createMockRequest('GET', '/api/bookings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.bookings).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should pass filter parameters to service', async () => {
      mockBookingService.getBookings.mockResolvedValue({
        bookings: [],
        total: 0,
      });

      const request = createMockRequest(
        'GET',
        '/api/bookings?status=confirmed&type=surf-week&limit=10&offset=5'
      );
      await GET(request);

      expect(mockBookingService.getBookings).toHaveBeenCalledWith({
        status: 'confirmed',
        payment_status: undefined,
        type: 'surf-week',
        roomId: undefined,
        search: undefined,
        start_date: undefined,
        end_date: undefined,
        limit: 10,
        offset: 5,
      });
    });

    it('should require admin authentication', async () => {
      const mockAuthError = new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
      mockRequireAdminAuth.mockReturnValue(mockAuthError as any);

      const request = createMockRequest('GET', '/api/bookings');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle service errors gracefully', async () => {
      mockBookingService.getBookings.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('GET', '/api/bookings');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should include cache-busting headers', async () => {
      mockBookingService.getBookings.mockResolvedValue({
        bookings: [],
        total: 0,
      });

      const request = createMockRequest('GET', '/api/bookings');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('Pragma')).toBe('no-cache');
    });
  });

  // ==========================================================================
  // POST /api/bookings - Room Booking
  // ==========================================================================

  describe('POST /api/bookings - Room Booking', () => {
    const validRoomBooking = {
      room_id: 'room-123',
      start_date: '2024-03-01',
      end_date: '2024-03-05',
      participants: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      ],
      guests: 2,
      clientName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    };

    it('should create room booking with valid data', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: true,
        bookingId: 'booking-new-123',
        clientId: 'client-456',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
      });

      const request = createMockRequest('POST', '/api/bookings', validRoomBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.booking.id).toBe('booking-new-123');
      expect(data.data.booking.status).toBe('pending');
      expect(data.data.client.name).toBe('John Doe');
    });

    it('should return error for invalid room booking', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: false,
        error: 'Room not available for selected dates',
      });

      const request = createMockRequest('POST', '/api/bookings', validRoomBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Room not available for selected dates');
    });

    it('should return 409 for conflicting booking', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: false,
        error: 'Room is already booked for these dates',
      });

      const request = createMockRequest('POST', '/api/bookings', validRoomBooking);
      const response = await POST(request);

      expect(response.status).toBe(409);
    });
  });

  // ==========================================================================
  // POST /api/bookings - Surf Week Booking
  // ==========================================================================

  describe('POST /api/bookings - Surf Week Booking', () => {
    const validSurfWeekBooking = {
      camp_id: 'camp-123',
      participants: [
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1987654321',
        },
      ],
      pricing: {
        checkIn: '2024-04-01',
        checkOut: '2024-04-08',
        total: 1500,
      },
      room_assignments: [
        {
          roomId: 'room-1',
          guestIds: ['guest-1'],
        },
      ],
    };

    it('should create surf week booking with valid data', async () => {
      mockBookingService.createSurfWeekBooking.mockResolvedValue({
        success: true,
        bookingId: 'surf-booking-789',
        clientId: 'client-789',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
      });

      const request = createMockRequest('POST', '/api/bookings', validSurfWeekBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.booking.id).toBe('surf-booking-789');
      expect(data.data.client.email).toBe('jane@example.com');
    });

    it('should return error for duplicate surf week booking', async () => {
      mockBookingService.createSurfWeekBooking.mockResolvedValue({
        success: false,
        error: 'Duplicate booking detected',
        errorCode: 'DUPLICATE_BOOKING',
        duplicateBookingId: 'existing-booking-123',
      });

      const request = createMockRequest('POST', '/api/bookings', validSurfWeekBooking);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.errorCode).toBe('DUPLICATE_BOOKING');
      expect(data.duplicateBookingId).toBe('existing-booking-123');
    });

    it('should return 400 for invalid surf week booking', async () => {
      mockBookingService.createSurfWeekBooking.mockResolvedValue({
        success: false,
        error: 'Invalid camp ID',
        errorCode: 'INVALID_CAMP',
      });

      const request = createMockRequest('POST', '/api/bookings', validSurfWeekBooking);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  // ==========================================================================
  // Error Handling
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle JSON parse errors', async () => {
      const request = new NextRequest(new URL('/api/bookings', 'http://localhost:3000'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    it('should handle service exceptions', async () => {
      mockBookingService.createRoomBooking.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('POST', '/api/bookings', {
        room_id: 'room-123',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database connection failed');
    });
  });

  // ==========================================================================
  // Response Shape
  // ==========================================================================

  describe('Response Shape', () => {
    it('should have consistent success response shape', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: true,
        bookingId: 'booking-123',
        clientId: 'client-456',
        clientName: 'Test User',
        clientEmail: 'test@example.com',
      });

      const request = createMockRequest('POST', '/api/bookings', {
        room_id: 'room-123',
        start_date: '2024-03-01',
        end_date: '2024-03-05',
        clientName: 'Test User',
        email: 'test@example.com',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('booking');
      expect(data.data).toHaveProperty('client');
      expect(data.data).toHaveProperty('payment');
    });

    it('should have consistent error response shape', async () => {
      mockBookingService.createRoomBooking.mockResolvedValue({
        success: false,
        error: 'Validation failed',
      });

      const request = createMockRequest('POST', '/api/bookings', {
        room_id: 'room-123',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
    });
  });
});
