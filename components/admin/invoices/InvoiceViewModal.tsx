'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Download, Mail, Calendar, Euro } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

interface Invoice {
  id: string
  booking_id: string
  invoice_number: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  sent_date?: string
  paid_date?: string
  created_at: string
  bookings?: {
    id: string
    total_amount: number
    payment_status: string
    client_ids?: string[]
    items?: InvoiceItem[]
  }
}

interface InvoiceViewModalProps {
  open: boolean
  onClose: () => void
  invoice: Invoice | null
  onEdit?: () => void
}

export function InvoiceViewModal({ open, onClose, invoice, onEdit }: InvoiceViewModalProps) {
  if (!invoice) return null

  const handleDownloadPDF = async () => {
    // Open invoice in new tab - user can print to PDF from there
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {invoice.invoice_number}
          </DialogTitle>
          <DialogDescription>
            Invoice details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit Invoice
              </Button>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Invoice Number</p>
              <p className="text-lg font-semibold">{invoice.invoice_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Euro className="h-4 w-4" />
                {invoice.amount.toFixed(2)} {invoice.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-sm font-mono">{invoice.booking_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm">{formatDate(invoice.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Due Date</p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(invoice.due_date)}
              </p>
            </div>
            {invoice.sent_date && (
              <div>
                <p className="text-sm text-gray-500">Sent Date</p>
                <p className="text-sm">{formatDate(invoice.sent_date)}</p>
              </div>
            )}
            {invoice.paid_date && (
              <div>
                <p className="text-sm text-gray-500">Paid Date</p>
                <p className="text-sm">{formatDate(invoice.paid_date)}</p>
              </div>
            )}
          </div>

          {/* Booking Information */}
          {invoice.bookings && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Booking Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Booking Total</p>
                  <p className="font-semibold">€{invoice.bookings.total_amount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Status</p>
                  <p className="font-semibold">{invoice.bookings.payment_status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownloadPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              View Invoice
            </Button>
            <Button variant="outline" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

