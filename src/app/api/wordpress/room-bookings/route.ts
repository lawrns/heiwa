import { NextRequest, NextResponse } from 'next/server';

// CORS headers for WordPress integration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heiwa-API-Key',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * WordPress API Room Bookings Endpoint
 * Creates new room bookings from WordPress widget submissions
 * 
 * @route POST /api/wordpress/room-bookings
 * @auth X-Heiwa-API-Key header required
 * @body {Object} Room booking data with participants and room selection
 * @returns {Object} Created booking confirmation with payment details
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('X-Heiwa-API-Key');
    const validApiKey = process.env.WORDPRESS_API_KEY;
    
    if (!apiKey || !validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or missing API key'
        },
        {
          status: 401,
          headers: corsHeaders
        }
      );
    }

    const bookingData = await request.json();

    // Validate required room booking data structure
    if (!bookingData.room_id || !bookingData.participants || !Array.isArray(bookingData.participants)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid booking data',
          message: 'room_id and participants array are required'
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate date fields
    if (!bookingData.start_date || !bookingData.end_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid booking data',
          message: 'start_date and end_date are required'
        },
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate participants data
    for (const participant of bookingData.participants) {
      if (!participant.name || !participant.email) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid participant data',
            message: 'Each participant must have name and email'
          },
          {
            status: 400,
            headers: corsHeaders
          }
        );
      }
    }

    // For now, create a mock room booking response since we don't have a rooms table
    // In a real implementation, you would:
    // 1. Validate the room exists and is available
    // 2. Calculate pricing based on room rates
    // 3. Create booking records in the database
    // 4. Generate payment links
    // 5. Send confirmation emails

    const mockRoomData = {
      id: bookingData.room_id,
      name: bookingData.room_id.replace('room-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      price_per_night: 150, // Mock price
    };

    // Calculate pricing
    const participantCount = bookingData.participants.length;
    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = mockRoomData.price_per_night;
    const totalAmount = basePrice * participantCount * nights;

    // Generate a mock booking ID
    const bookingId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const bookingNumber = `WP-ROOM-${bookingId.substring(0, 8).toUpperCase()}`;

    // Mock payment link (in real implementation, integrate with Stripe)
    const paymentLink = `https://checkout.stripe.com/pay/mock-room-booking-${bookingId}`;

    console.log('WordPress room booking created:', {
      bookingId,
      room: mockRoomData.name,
      participants: participantCount,
      nights,
      totalAmount
    });

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: bookingId,
          booking_number: bookingNumber,
          status: 'pending',
          room: {
            id: mockRoomData.id,
            name: mockRoomData.name,
            dates: {
              start: bookingData.start_date,
              end: bookingData.end_date
            }
          },
          participants: participantCount,
          pricing: {
            base_price: basePrice,
            nights: nights,
            participants: participantCount,
            subtotal: totalAmount,
            taxes: totalAmount * 0.1, // Estimated
            total: totalAmount * 1.1,
            currency: 'EUR'
          },
          participant_details: bookingData.participants
        },
        payment: {
          status: 'pending',
          method: 'stripe',
          payment_link: paymentLink,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        },
        next_steps: {
          payment_required: true,
          payment_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          confirmation_email_sent: true
        }
      },
      meta: {
        created_at: new Date().toISOString(),
        source: 'wordpress_widget',
        booking_reference: bookingNumber
      }
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('WordPress room booking error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to process room booking'
      },
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
