// Invoice generation utility
// Generates invoice numbers and creates invoices from bookings

import { supabaseAdmin } from '@/lib/supabase'

export interface InvoiceData {
  booking_id: string
  amount: number
  currency?: string
  due_date?: string
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

/**
 * Generate invoice number in format: HW-INV-YYYY-XXXX
 * Example: HW-INV-2025-0001
 */
export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `HW-INV-${year}-`

  // Get the latest invoice number for this year
  const { data: latestInvoice, error } = await supabaseAdmin
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching latest invoice:', error)
    throw new Error('Failed to generate invoice number')
  }

  let sequenceNumber = 1
  if (latestInvoice?.invoice_number) {
    const lastNumber = latestInvoice.invoice_number.split('-').pop()
    sequenceNumber = parseInt(lastNumber || '0', 10) + 1
  }

  // Format with leading zeros (4 digits)
  const formattedNumber = sequenceNumber.toString().padStart(4, '0')
  return `${prefix}${formattedNumber}`
}

/**
 * Create an invoice from a booking
 */
export async function createInvoiceFromBooking(invoiceData: InvoiceData): Promise<{ id: string; invoice_number: string }> {
  const invoiceNumber = await generateInvoiceNumber()

  const invoice = {
    booking_id: invoiceData.booking_id,
    invoice_number: invoiceNumber,
    amount: invoiceData.amount,
    currency: invoiceData.currency || 'EUR',
    status: invoiceData.status || 'draft',
    due_date: invoiceData.due_date || null,
    sent_date: null,
    paid_date: null,
  }

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert(invoice)
    .select('id, invoice_number')
    .single()

  if (error) {
    console.error('Error creating invoice:', error)
    throw new Error(`Failed to create invoice: ${error.message}`)
  }

  return { id: data.id, invoice_number: data.invoice_number }
}

/**
 * Calculate due date (default: 30 days from now)
 */
export function calculateDueDate(days: number = 30): string {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + days)
  return dueDate.toISOString().split('T')[0]
}

