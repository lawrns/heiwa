import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null as any;
  return createClient(url, key);
}

/**
 * TEST-ONLY Booking Creation Endpoint
 * Creates confirmed bookings for testing occupancy changes
 * 
 * @route POST /api/test/create-booking
 * @auth NODE_ENV !== 'production' required
 * @body { surfCampId: string, participants: number, clientEmail?: string }
 * @returns { success: boolean, bookingId?: string, error?: string }
 */
export async function POST(request: NextRequest) {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    const client = createSupabase();
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { surfCampId, participants = 1, clientEmail = 'test@example.com' } = body;

    if (!surfCampId) {
      return NextResponse.json(
        { success: false, error: 'surfCampId is required' },
        { status: 400 }
      );
    }

    // Verify surf camp exists
    const { data: surfCamp, error: campError } = await client
      .from('surf_camps')
      .select('id, name, price, max_participants')
      .eq('id', surfCampId)
      .single();

    if (campError || !surfCamp) {
      return NextResponse.json(
        { success: false, error: 'Surf camp not found' },
        { status: 404 }
      );
    }

    // Create or get test client
    let clientId: string;
    const { data: existingClient } = await client
      .from('clients')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await client
        .from('clients')
        .insert({
          name: 'Test User',
          email: clientEmail,
          phone: '+1234567890',
          notes: 'Test booking client'
        })
        .select('id')
        .single();

      if (clientError || !newClient) {
        return NextResponse.json(
          { success: false, error: 'Failed to create test client' },
          { status: 500 }
        );
      }
      clientId = newClient.id;
    }

    // Create confirmed booking
    const totalAmount = surfCamp.price * participants;
    const bookingData = {
      client_ids: [clientId],
      items: JSON.stringify([{
        type: 'surfCamp',
        itemId: surfCampId,
        quantity: participants,
        unitPrice: surfCamp.price,
        totalPrice: totalAmount
      }]),
      total_amount: totalAmount,
      payment_status: 'confirmed',
      payment_method: 'stripe',
      notes: `Test booking for ${surfCamp.name} - ${participants} participants`,
      source: 'api'
    };

    const { data: booking, error: bookingError } = await client
      .from('bookings')
      .insert(bookingData)
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('Test booking creation error:', bookingError);
      return NextResponse.json(
        { success: false, error: 'Failed to create test booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: `Test booking created for ${surfCamp.name} with ${participants} participants`,
      surfCamp: {
        id: surfCamp.id,
        name: surfCamp.name,
        price: surfCamp.price
      },
      totalAmount
    });

  } catch (error: any) {
    console.error('Test booking endpoint error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/test/create-booking - Clean up test bookings
 */
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    const client = createSupabase();
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Delete test bookings (those with notes containing "Test booking")
    const { data: deletedBookings, error: deleteError } = await client
      .from('bookings')
      .delete()
      .ilike('notes', '%Test booking%')
      .select('id');

    if (deleteError) {
      console.error('Test booking cleanup error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to clean up test bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedBookings?.length || 0} test bookings`
    });

  } catch (error: any) {
    console.error('Test booking cleanup error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
