'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

interface Payment {
  id: string
  booking_id: string
  amount: number
  currency: string
  payment_method: 'stripe' | 'cash' | 'transfer' | 'paypal' | 'other'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  transaction_id?: string
  payment_date?: string
  refund_amount?: number
  refund_reason?: string
  notes?: string
  created_at: string
}

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  payment?: Payment | null
  bookingId?: string
  onSaved: () => void
}

export function PaymentModal({ open, onClose, payment, bookingId, onSaved }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    booking_id: bookingId || payment?.booking_id || '',
    amount: payment?.amount || 0,
    currency: payment?.currency || 'EUR',
    payment_method: payment?.payment_method || 'cash',
    payment_status: payment?.payment_status || 'completed',
    transaction_id: payment?.transaction_id || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    notes: payment?.notes || '',
  })

  // Reset form when payment prop changes or modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        booking_id: bookingId || payment?.booking_id || '',
        amount: payment?.amount || 0,
        currency: payment?.currency || 'EUR',
        payment_method: payment?.payment_method || 'cash',
        payment_status: payment?.payment_status || 'completed',
        transaction_id: payment?.transaction_id || '',
        payment_date: payment?.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: payment?.notes || '',
      })
    }
  }, [open, payment, bookingId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.booking_id || !formData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = payment ? `/api/payments/${payment.id}` : '/api/payments'
      const method = payment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : new Date().toISOString(),
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save payment')
      }

      toast.success(payment ? 'Payment updated successfully' : 'Payment recorded successfully')
      onSaved()
      onClose()
    } catch (error: any) {
      console.error('Error saving payment:', error)
      toast.error(error.message || 'Failed to save payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
          <DialogDescription>
            {payment ? 'Update payment details' : 'Record a manual payment'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="booking_id">Booking ID *</Label>
            <Input
              id="booking_id"
              value={formData.booking_id}
              onChange={(e) => setFormData(prev => ({ ...prev, booking_id: e.target.value }))}
              disabled={!!payment}
              required
            />
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
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Status</Label>
              <Select
                value={formData.payment_status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, payment_status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_id: e.target.value }))}
                placeholder="e.g., ch_1234567890"
              />
            </div>

            <div>
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Refund Information Display (read-only when editing) */}
          {payment && (payment.refund_amount || 0) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orange-900 mb-2">Refund Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-orange-700">Refunded Amount</p>
                  <p className="font-semibold text-lg text-orange-900">
                    €{(payment.refund_amount || 0).toFixed(2)} {payment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-orange-700">Remaining Amount</p>
                  <p className="font-semibold text-lg text-green-700">
                    €{(payment.amount - (payment.refund_amount || 0)).toFixed(2)} {payment.currency}
                  </p>
                </div>
                {payment.refund_reason && (
                  <div className="col-span-2">
                    <p className="text-orange-700">Refund Reason</p>
                    <p className="font-medium text-orange-900">{payment.refund_reason}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Note: Refunds are managed separately. Use the refund button in the payments list to process refunds.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes about this payment..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

