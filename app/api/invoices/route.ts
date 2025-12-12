// Invoices API
// CRUD operations for invoice management

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createInvoiceFromBooking, calculateDueDate } from '@/lib/invoices/generator'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/invoices - Get all invoices with filters
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const bookingId = searchParams.get('booking_id')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'

    // For now, bypass RLS and use service role for admin operations
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
        { success: false, error: 'Failed to fetch invoices', details: error.message },
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
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

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

    const invoiceResponse = {
      id: (invoice as any).id,
      invoice_number: (invoice as any).invoice_number,
      booking_id,
      amount,
      currency: currency || 'EUR',
      due_date: due_date || calculateDueDate(),
      status: status || 'draft',
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
      const invoiceData = invoice as any

      // Send invoice email
      try {
        await fetch('/api/email/invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: client.email,
            clientName: `${client.first_name} ${client.last_name}`,
            invoiceNumber: invoiceData.invoice_number,
            amount: invoiceData.amount,
            currency: invoiceData.currency,
            dueDate: invoiceData.due_date,
            status: invoiceData.status,
            bookingId: invoiceData.booking_id,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: { invoice: invoiceResponse }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

