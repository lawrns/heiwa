// Payment API - Individual payment operations

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

// GET /api/payments/[id] - Get a specific payment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { data, error } = await supabaseAdmin
      .from('payments')
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
          { success: false, error: 'Payment not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching payment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { payment: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/payments/[id] - Update a payment
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
      .from('payments')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating payment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { payment: data }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/payments/[id] - Delete a payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { error } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting payment:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete payment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

