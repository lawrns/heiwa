// Payments API
// CRUD operations for payment management

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/payments - Get all payments with filters
export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json()
    const { booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_date, notes } = body

    if (!booking_id || amount === undefined || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'booking_id, amount, and payment_method are required' },
        { status: 400 }
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
      refund_amount: null,
      refund_reason: null,
      notes: notes || null,
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert(payment as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating payment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Update booking payment status if payment is completed
    if (payment_status === 'completed') {
      await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'paid' } as any)
        .eq('id', booking_id)
    }

    // Fetch client details for email
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        client_ids,
        clients:client_ids (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', booking_id)
      .single() as any

    if (booking?.clients) {
      const client = (booking as any).clients
      const paymentData = data as any

      // Send confirmation email
      try {
        await fetch('/api/email/payment-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: client.email,
            clientName: `${client.first_name} ${client.last_name}`,
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

    return NextResponse.json({
      success: true,
      data: { payment: data }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}

