// Payments API
// CRUD operations for payment management

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/payments - Get all payments with filters
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('payment_method')
    const bookingId = searchParams.get('booking_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // For now, bypass RLS and use service role for admin operations
    let query = supabaseAdmin
      .from('payments')
      .select(`
        *,
        bookings (
          id,
          total_amount,
          payment_status,
          client_ids
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      query = query.eq('payment_status', status)
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod)
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }
    if (search) {
      query = query.or(`transaction_id.ilike.%${search}%,booking_id.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payments', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { payments: data || [] },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Create a new payment (manual payment recording)
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_date, notes } = body

    if (!booking_id || amount === undefined || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'booking_id, amount, and payment_method are required' },
        { status: 400 }
      )
    }

    // Validate that the booking_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(booking_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format. Please enter a valid booking ID.' },
        { status: 400 }
      )
    }

    // Verify that the booking exists
    const { data: existingBooking, error: bookingCheckError } = await supabaseAdmin
      .from('bookings')
      .select('id, total_amount, client_ids')
      .eq('id', booking_id)
      .single()

    if (bookingCheckError || !existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found. Please verify the booking ID and try again.' },
        { status: 404 }
      )
    }

    const payment = {
      booking_id,
      amount,
      currency: currency || 'EUR',
      payment_method,
      payment_status: payment_status || 'completed',
      transaction_id: transaction_id || null,
      payment_date: payment_date || new Date().toISOString(),
      refund_amount: 0, // Use 0 instead of null to satisfy CHECK constraint (refund_amount >= 0)
      refund_reason: null,
      notes: notes || null,
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert(payment)
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      // Return detailed error for better debugging
      return NextResponse.json(
        { success: false, error: 'Failed to create payment', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    // Update booking payment status if payment is completed
    if (payment_status === 'completed') {
      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking_id)
    }

    // Fetch client details for email
    // client_ids is an array, so we need to fetch clients separately
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('id, client_ids')
      .eq('id', booking_id)
      .single()

    if (booking?.client_ids && Array.isArray(booking.client_ids) && booking.client_ids.length > 0) {
      // Get the first client ID from the array
      const firstClientId = booking.client_ids[0]
      
      // Fetch client details separately
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id, name, email')
        .eq('id', firstClientId)
        .single()

      if (client) {
        const paymentData = data as {
          id: string
          amount: number
          currency: string
          payment_status: string
          payment_date: string
          payment_method?: string
          transaction_id?: string | null
          booking_id?: string
        }

        // Send confirmation email
        try {
          await fetch('/api/email/payment-confirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: client.email,
              clientName: client.name || 'Guest',
              amount: paymentData.amount,
              currency: paymentData.currency,
              paymentMethod: paymentData.payment_method,
              transactionId: paymentData.transaction_id,
              paymentStatus: paymentData.payment_status,
              bookingId: paymentData.booking_id,
            }),
          })
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError)
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { payment: data }
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating payment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

