import { NextRequest, NextResponse } from 'next/server';
import { bookingService } from '@/lib/services/booking.service';
import type { SurfWeekBookingInput, RoomBookingInput } from '@/lib/services/booking.service';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * Booking API Routes
 *
 * GET  /api/bookings - Fetch bookings with optional filters
 * POST /api/bookings - Create a new booking (surf week or room)
 */

// Cache-busting headers for all responses
const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Last-Modified': new Date().toUTCString(),
};

export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const payment_status = searchParams.get('payment_status') || undefined;
    const type = searchParams.get('type') || undefined;
    const roomId = searchParams.get('roomId') || undefined;
    const search = searchParams.get('search') || undefined;
    const start_date = searchParams.get('start_date') || undefined;
    const end_date = searchParams.get('end_date') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const offset = parseInt(searchParams.get('offset') || '0');

    const { bookings, total } = await bookingService.getBookings({
      status,
      payment_status,
      type,
      roomId,
      search,
      start_date,
      end_date,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        data: { bookings },
        count: total,
        total,
        limit: limit || bookings.length,
        offset,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Detect booking type: surf week (has camp_id) or room booking
    const isSurfWeekBooking = body.camp_id && body.participants;

    if (isSurfWeekBooking) {
      const input: SurfWeekBookingInput = {
        camp_id: body.camp_id,
        participants: body.participants || [],
        pricing: body.pricing || {},
        source_url: body.source_url,
        widget_version: body.widget_version,
        room_assignments: body.room_assignments,
      };

      const result = await bookingService.createSurfWeekBooking(input);

      if (!result.success) {
        const statusCode = result.errorCode === 'DUPLICATE_BOOKING' ? 409 : 400;
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            errorCode: result.errorCode,
            duplicateBookingId: result.duplicateBookingId,
          },
          { status: statusCode }
        );
      }

      // Send confirmation emails (non-blocking)
      sendBookingEmails({
        bookingId: result.bookingId!,
        guestName: result.clientName!,
        guestEmail: result.clientEmail!,
        checkIn: body.pricing?.checkIn || '',
        checkOut: body.pricing?.checkOut || '',
        itemName: 'Surf Camp',
        totalAmount: body.pricing?.total || 0,
      });

      return NextResponse.json({
        success: true,
        data: {
          booking: {
            id: result.bookingId,
            booking_number: `HW-${result.bookingId!.slice(-6).toUpperCase()}`,
            status: 'pending',
          },
          client: {
            id: result.clientId,
            name: result.clientName,
            email: result.clientEmail,
          },
          payment: {
            payment_link: null,
            status: 'pending',
          },
        },
      });
    } else {
      // Room booking
      const input: RoomBookingInput = {
        room_id: body.room_id,
        start_date: body.start_date,
        end_date: body.end_date,
        participants: body.participants,
        guests: body.guests,
        clientName: body.clientName,
        email: body.email,
        phone: body.phone,
        message: body.message,
      };

      const result = await bookingService.createRoomBooking(input);

      if (!result.success) {
        const statusCode = result.error?.includes('already booked') ? 409 : 400;
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: statusCode }
        );
      }

      // Send confirmation emails (non-blocking)
      sendBookingEmails({
        bookingId: result.bookingId!,
        guestName: result.clientName!,
        guestEmail: result.clientEmail!,
        checkIn: body.start_date,
        checkOut: body.end_date,
        itemName: 'Room',
        totalAmount: 0,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            booking: {
              id: result.bookingId,
              booking_number: `HW-${result.bookingId!.slice(-6).toUpperCase()}`,
              status: 'pending',
            },
            client: {
              id: result.clientId,
              name: result.clientName,
              email: result.clientEmail,
            },
            payment: {
              payment_link: null,
              status: 'pending',
            },
          },
        },
        { headers: noCacheHeaders }
      );
    }
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper to send booking emails (non-blocking)
function sendBookingEmails(params: {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  itemName: string;
  totalAmount: number;
}) {
  import('@/lib/email-service')
    .then(({ emailService }) => {
      const emailParams = {
        bookingId: params.bookingId,
        guestName: params.guestName,
        guestEmail: params.guestEmail,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        ...(params.itemName === 'Surf Camp'
          ? { surfCampName: params.itemName }
          : { roomName: params.itemName }),
        totalAmount: params.totalAmount,
        currency: 'EUR',
        status: 'pending',
      };

      emailService.sendBookingConfirmation(emailParams).catch((err: Error) => {
        console.error('Failed to send booking confirmation email:', err);
      });

      emailService.sendBookingNotificationToAdmin(emailParams).catch((err: Error) => {
        console.error('Failed to send admin notification email:', err);
      });
    })
    .catch((err: Error) => {
      console.error('Failed to load email service:', err);
    });
}
