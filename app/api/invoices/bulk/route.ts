// Bulk Operations API for Invoices
// POST /api/invoices/bulk

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const { action, invoiceIds } = body

    if (!action || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Action and invoiceIds are required' },
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
          .from('invoices')
          .update({ status })
          .in('id', invoiceIds)
          .select('id')

        if (error) {
          console.error('Error updating invoices:', error)
          return NextResponse.json(
            { success: false, error: 'Failed to update invoices' },
            { status: 500 }
          )
        }

        updatedCount = data?.length || 0
        result = { updated: updatedCount }
        break

      case 'send':
        // Fetch invoices with booking/client data
        const { data: invoices, error: fetchError } = await supabaseAdmin
          .from('invoices')
          .select(`
            id,
            invoice_number,
            amount,
            currency,
            due_date,
            status,
            booking_id,
            bookings:booking_id (
              client_ids,
              clients:client_ids (
                name,
                email
              )
            )
          `)
          .in('id', invoiceIds)
          .eq('status', 'draft')

        if (fetchError) {
          console.error('Error fetching invoices:', fetchError)
          return NextResponse.json(
            { success: false, error: 'Failed to fetch invoices' },
            { status: 500 }
          )
        }

        // Update status to 'sent' and send emails
        const sendPromises = (invoices || []).map(async (invoice: {
          id: string
          invoice_number: string
          amount: number
          currency: string
          due_date: string
          booking_id: string
          bookings?: Array<{
            client_ids: string[]
            clients: Array<{
              name: string
              email: string
            }>
          }>
        }) => {
          // Update status
          await supabaseAdmin
            .from('invoices')
            .update({ status: 'sent', sent_date: new Date().toISOString() })
            .eq('id', invoice.id)

          // Send email if client email exists
          const firstBooking = invoice.bookings?.[0]
          if (firstBooking?.clients?.[0]?.email) {
            await emailService.sendInvoice({
              invoiceNumber: invoice.invoice_number,
              clientName: firstBooking.clients[0].name || 'Guest',
              clientEmail: firstBooking.clients[0].email,
              amount: invoice.amount,
              currency: invoice.currency,
              dueDate: invoice.due_date,
              status: 'sent',
              bookingId: invoice.booking_id,
            }).catch(err => console.error('Failed to send invoice email:', err))
          }
        })

        await Promise.all(sendPromises)
        updatedCount = invoices?.length || 0
        result = { sent: updatedCount }
        break

      case 'delete':
        const { error: deleteError } = await supabaseAdmin
          .from('invoices')
          .delete()
          .in('id', invoiceIds)

        if (deleteError) {
          console.error('Error deleting invoices:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to delete invoices' },
            { status: 500 }
          )
        }

        updatedCount = invoiceIds.length
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
      message: `Successfully processed ${updatedCount} invoice(s)`
    })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

