'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const [formData, setFormData] = useState({
    booking_id: bookingId || invoice?.booking_id || '',
    amount: invoice?.amount || 0,
    currency: invoice?.currency || 'EUR',
    status: invoice?.status || 'draft',
    due_date: invoice?.due_date || '',
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          <DialogDescription>
            {invoice ? 'Update invoice details' : 'Create a new invoice from a booking'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="booking_id">Booking ID *</Label>
            <Input
              id="booking_id"
              value={formData.booking_id}
              onChange={(e) => setFormData(prev => ({ ...prev, booking_id: e.target.value }))}
              disabled={!!invoice}
              required
            />
            {booking && (
              <p className="text-sm text-gray-500 mt-1">
                Booking total: €{booking.total_price || booking.total_amount}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

