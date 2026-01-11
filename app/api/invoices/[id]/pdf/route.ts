// Invoice PDF API - Generate PDF for a specific invoice

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

// GET /api/invoices/[id]/pdf - Generate PDF for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch invoice data with related booking information
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        bookings (
          id,
          total_amount,
          payment_status,
          client_ids,
          notes,
          check_in,
          check_out,
          guests
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
      console.error('Error fetching invoice for PDF:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch invoice' },
        { status: 500 }
      )
    }

    // Generate HTML invoice that can be printed to PDF by the browser
    const htmlContent = generateInvoiceHTML(data)

    // Return as HTML with proper headers for viewing/printing
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${data.invoice_number}.html"`
      }
    })

  } catch (error) {
    console.error('Unexpected error generating PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

interface Invoice {
  invoice_number: string
  created_at: string
  due_date: string | null
  amount: number
  currency: string
  status: string
  booking_id: string
  bookings?: Array<{
    total_amount?: number
    payment_status?: string
    guests?: number
    check_in?: string
    check_out?: string
    notes?: string
    client_ids: string[]
    clients: Array<{
      name: string
      email: string
    }>
  }>
}

function generateInvoiceHTML(invoice: Invoice): string {
  const createdDate = formatDate(invoice.created_at)
  const dueDate = formatDate(invoice.due_date)
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoice.invoice_number}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1a4252; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0; }
        .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .detail-group h3 { color: #f97316; margin: 0 0 10px 0; font-size: 16px; }
        .detail-group p { margin: 5px 0; color: #333; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status.draft { background: #fef3c7; color: #92400e; }
        .status.sent { background: #dbeafe; color: #1e40af; }
        .status.paid { background: #d1fae5; color: #065f46; }
        .status.overdue { background: #fee2e2; color: #991b1b; }
        .status.cancelled { background: #f3f4f6; color: #374151; }
        .amount { font-size: 24px; font-weight: bold; color: #1a4252; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <h1>Invoice #${invoice.invoice_number}</h1>
            <p>Heiwa House - Premium Surf & Lifestyle Retreat</p>
        </div>
        
        <div class="invoice-details">
            <div class="detail-group">
                <h3>Invoice Details</h3>
                <p><strong>Status:</strong> <span class="status ${invoice.status}">${invoice.status}</span></p>
                <p><strong>Amount:</strong> <span class="amount">€${invoice.amount.toFixed(2)} ${invoice.currency}</span></p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Created:</strong> ${createdDate}</p>
            </div>
            
            <div class="detail-group">
                <h3>Booking Information</h3>
                <p><strong>Booking ID:</strong> ${invoice.booking_id}</p>
                ${invoice.bookings && invoice.bookings[0] ? `
                <p><strong>Booking Total:</strong> €${invoice.bookings[0].total_amount || 0}</p>
                <p><strong>Payment Status:</strong> ${invoice.bookings[0].payment_status}</p>
                <p><strong>Guests:</strong> ${invoice.bookings[0].guests || 1}</p>
                ${invoice.bookings[0].check_in ? `<p><strong>Check-in:</strong> ${formatDate(invoice.bookings[0].check_in)}</p>` : ''}
                ${invoice.bookings[0].check_out ? `<p><strong>Check-out:</strong> ${formatDate(invoice.bookings[0].check_out)}</p>` : ''}
                ` : ''}
            </div>
        </div>
        
        ${invoice.bookings && invoice.bookings[0]?.notes ? `
        <div class="detail-group">
            <h3>Notes</h3>
            <p>${invoice.bookings[0].notes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
            <p>Thank you for choosing Heiwa House!</p>
            <p>For questions, please contact our team.</p>
        </div>
    </div>
</body>
</html>
  `.trim()
}
