/**
 * Payments API Integration Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the /api/payments endpoint
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/payments/route';

// Mock Supabase admin client
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

// Mock admin auth
jest.mock('@/lib/admin-auth', () => ({
  requireAdminAuth: jest.fn(() => null), // Return null = authenticated
}));

// Import mocked modules
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/admin-auth';

describe('Payments API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset admin auth to return null (authenticated) by default
    (requireAdminAuth as jest.Mock).mockReturnValue(null);
  });

  describe('GET /api/payments', () => {
    it('should return payments list with pagination', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          booking_id: 'booking-1',
          amount: 500,
          currency: 'EUR',
          payment_method: 'card_stripe',
          payment_status: 'completed',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'payment-2',
          booking_id: 'booking-2',
          amount: 750,
          currency: 'EUR',
          payment_method: 'bank_wire',
          payment_status: 'pending',
          created_at: '2025-01-02T00:00:00Z',
        },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockPayments,
          error: null,
          count: 2,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest('http://localhost:3000/api/payments');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.payments).toHaveLength(2);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(2);
    });

    it('should filter payments by status', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        'http://localhost:3000/api/payments?status=completed'
      );
      const response = await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith('payment_status', 'completed');
    });

    it('should filter payments by payment method', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        'http://localhost:3000/api/payments?payment_method=card_stripe'
      );
      const response = await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith('payment_method', 'card_stripe');
    });

    it('should filter payments by booking ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        'http://localhost:3000/api/payments?booking_id=booking-123'
      );
      const response = await GET(request);

      expect(mockQuery.eq).toHaveBeenCalledWith('booking_id', 'booking-123');
    });

    it('should handle search parameter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
          count: 0,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest(
        'http://localhost:3000/api/payments?search=txn_123'
      );
      const response = await GET(request);

      expect(mockQuery.or).toHaveBeenCalledWith(
        expect.stringContaining('txn_123')
      );
    });

    it('should require admin authentication', async () => {
      (requireAdminAuth as jest.Mock).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const request = new NextRequest('http://localhost:3000/api/payments');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
          count: 0,
        }),
      };

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockQuery);

      const request = new NextRequest('http://localhost:3000/api/payments');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch payments');
    });
  });

  describe('POST /api/payments', () => {
    it('should create a new payment', async () => {
      const validBookingId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPayment = {
        id: 'payment-new',
        booking_id: validBookingId,
        amount: 500,
        currency: 'EUR',
        payment_method: 'card_stripe',
        payment_status: 'completed',
      };

      // Mock the entire supabaseAdmin.from chain
      (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockPayment,
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'bookings') {
          return {
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: validBookingId, client_ids: [] },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === 'clients') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: validBookingId,
          amount: 500,
          payment_method: 'card_stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.payment).toBeDefined();
    });

    it('should require booking_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          amount: 500,
          payment_method: 'card_stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('booking_id');
    });

    it('should require amount', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: 'booking-1',
          payment_method: 'card_stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('amount');
    });

    it('should require payment_method', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: 'booking-1',
          amount: 500,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('payment_method');
    });

    it('should use default currency EUR', async () => {
      const validBookingId = '550e8400-e29b-41d4-a716-446655440001';
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'payment-1', currency: 'EUR' },
            error: null,
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            insert: insertMock,
          };
        }
        if (table === 'bookings') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: validBookingId, total_amount: 500, client_ids: [] },
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        if (table === 'clients') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: validBookingId,
          amount: 500,
          payment_method: 'card_stripe',
        }),
      });

      await POST(request);

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'EUR' })
      );
    });

    it('should require admin authentication', async () => {
      (requireAdminAuth as jest.Mock).mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: 'booking-1',
          amount: 500,
          payment_method: 'card_stripe',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should handle database errors on insert', async () => {
      const validBookingId = '550e8400-e29b-41d4-a716-446655440002';

      (supabaseAdmin.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'payments') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Insert failed', code: 'PGRST001' },
                }),
              }),
            }),
          };
        }
        if (table === 'bookings') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: validBookingId, total_amount: 500, client_ids: [] },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: validBookingId,
          amount: 500,
          payment_method: 'card_stripe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
