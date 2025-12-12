// Bulk Operations API for Payments
// POST /api/payments/bulk

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { action, paymentIds } = body

    if (!action || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and paymentIds are required' },
        { status: 400 }
      )
    }

    let result
    let updatedCount = 0

    switch (action) {
      case 'update_status':
        const { payment_status } = body
        if (!payment_status) {
          return NextResponse.json(
            { success: false, error: 'Payment status is required' },
            { status: 400 }
          )
        }

        const { data, error } = await supabaseAdmin
          .from('payments')
          .update({ payment_status })
          .in('id', paymentIds)
          .select('id')

        if (error) {
          console.error('Error updating payments:', error)
          return NextResponse.json(
            { success: false, error: 'Failed to update payments' },
            { status: 500 }
          )
        }

        updatedCount = data?.length || 0
        result = { updated: updatedCount }
        break

      case 'delete':
        const { error: deleteError } = await supabaseAdmin
          .from('payments')
          .delete()
          .in('id', paymentIds)

        if (deleteError) {
          console.error('Error deleting payments:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to delete payments' },
            { status: 500 }
          )
        }

        updatedCount = paymentIds.length
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
      message: `Successfully processed ${updatedCount} payment(s)`
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

