// Invoice API - Individual invoice operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/invoices/[id] - Get a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        bookings (
          id,
          total_amount,
          payment_status,
          client_ids,
          items,
          notes
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching invoice:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { invoice: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/invoices/[id] - Update an invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating invoice:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { invoice: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete invoice' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

