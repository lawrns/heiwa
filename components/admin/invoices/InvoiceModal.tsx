'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-toastify'

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
}

interface Booking {
  id: string
  total_amount: number
  payment_status: string
}

interface InvoiceModalProps {
  open: boolean
  onClose: () => void
  invoice?: Invoice | null
  bookingId?: string
  onSaved: () => void
}

export function InvoiceModal({ open, onClose, invoice, bookingId, onSaved }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false)
  
  // Helper function to format date for HTML input
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return ''
    return dateString.split('T')[0] // Extract YYYY-MM-DD from ISO datetime
  }
  
  const [formData, setFormData] = useState({
    booking_id: bookingId || invoice?.booking_id || '',
    amount: invoice?.amount || 0,
    currency: invoice?.currency || 'EUR',
    status: invoice?.status || 'draft',
    due_date: formatDateForInput(invoice?.due_date),
  })
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (open && formData.booking_id) {
      fetchBooking()
    }
  }, [open, formData.booking_id])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings?id=${formData.booking_id}`)
      const data = await response.json()
      if (data.success && data.data?.bookings?.[0]) {
        setBooking(data.data.bookings[0])
        if (!invoice && !formData.amount) {
          setFormData(prev => ({ ...prev, amount: data.data.bookings[0].total_price || 0 }))
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.booking_id || !formData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices'
      const method = invoice ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save invoice')
      }

      toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully')
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Error saving invoice:', error)
      toast.error(error.message || 'Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          <DialogDescription>
            {invoice ? 'Update invoice details' : 'Create a new invoice from a booking'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Booking Details Section */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Booking Details</h3>
            
            <div>
              <Label htmlFor="booking_id">Booking ID *</Label>
              <Input
                id="booking_id"
                value={formData.booking_id}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_id: e.target.value }))}
                disabled={!!invoice}
                required
                placeholder="Enter booking ID"
                className="mt-1.5"
              />
              {booking && (
                <p className="text-sm text-gray-500 mt-2">
                  Booking total: €{booking.total_amount}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-white">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoice Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  required
                  placeholder="0.00"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        Draft
                      </span>
                    </SelectItem>
                    <SelectItem value="sent">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Sent
                      </span>
                    </SelectItem>
                    <SelectItem value="paid">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Paid
                      </span>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Overdue
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Cancelled
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <div className="relative mt-1.5">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

