// Bulk Operations API for Bookings
// POST /api/bookings/bulk

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, bookingIds } = body

    if (!action || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and bookingIds are required' },
        { status: 400 }
      )
    }

    let result
    let updatedCount = 0

    switch (action) {
      case 'update_status':
        const { status } = body
        if (!status) {
          return NextResponse.json(
            { success: false, error: 'Status is required for update_status action' },
            { status: 400 }
          )
        }

        const { data, error } = await supabaseAdmin
          .from('bookings')
          .update({ status })
          .in('id', bookingIds)
          .select('id')

        if (error) {
          console.error('Error updating bookings:', error)
          return NextResponse.json(
            { success: false, error: 'Failed to update bookings' },
            { status: 500 }
          )
        }

        updatedCount = data?.length || 0
        result = { updated: updatedCount }
        break

      case 'update_payment_status':
        const { payment_status } = body
        if (!payment_status) {
          return NextResponse.json(
            { success: false, error: 'Payment status is required' },
            { status: 400 }
          )
        }

        const { data: paymentData, error: paymentError } = await supabaseAdmin
          .from('bookings')
          .update({ payment_status })
          .in('id', bookingIds)
          .select('id')

        if (paymentError) {
          console.error('Error updating payment status:', paymentError)
          return NextResponse.json(
            { success: false, error: 'Failed to update payment status' },
            { status: 500 }
          )
        }

        updatedCount = paymentData?.length || 0
        result = { updated: updatedCount }
        break

      case 'delete':
        const { error: deleteError } = await supabaseAdmin
          .from('bookings')
          .delete()
          .in('id', bookingIds)

        if (deleteError) {
          console.error('Error deleting bookings:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to delete bookings' },
            { status: 500 }
          )
        }

        updatedCount = bookingIds.length
        result = { deleted: updatedCount }
        break

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully processed ${updatedCount} booking(s)`
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

