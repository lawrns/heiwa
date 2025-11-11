// Invoices API
// CRUD operations for invoice management

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createInvoiceFromBooking, calculateDueDate } from '@/lib/invoices/generator'

// GET /api/invoices - Get all invoices with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bookingId = searchParams.get('booking_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    let query = supabaseAdmin
      .from('invoices')
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
      query = query.eq('status', status)
    }
    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,booking_id.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { invoices: data || [] },
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { booking_id, amount, currency, due_date, status } = body

    if (!booking_id || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'booking_id and amount are required' },
        { status: 400 }
      )
    }

    // Check if invoice already exists for this booking
    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('id')
      .eq('booking_id', booking_id)
      .single()

    if (existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice already exists for this booking' },
        { status: 400 }
      )
    }

    // Create invoice
    const invoice = await createInvoiceFromBooking({
      booking_id,
      amount,
      currency: currency || 'EUR',
      due_date: due_date || calculateDueDate(),
      status: status || 'draft',
    })

    // Fetch client and booking details for email
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        total_amount,
        client_ids,
        clients:client_ids (
          name,
          email
        )
      `)
      .eq('id', booking_id)
      .single()

    // Send invoice email if status is not draft and client email exists
    if (status !== 'draft' && booking?.clients?.[0]?.email) {
      import('@/lib/email-service').then(({ emailService }) => {
        emailService.sendInvoice({
          invoiceNumber: invoice.invoice_number,
          clientName: booking.clients[0].name || 'Guest',
          clientEmail: booking.clients[0].email,
          amount: invoice.amount,
          currency: invoice.currency,
          dueDate: invoice.due_date,
          status: invoice.status,
          bookingId: booking_id,
        }).catch(err => console.error('Failed to send invoice email:', err))
      })
    }

    return NextResponse.json({
      success: true,
      data: invoice
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

