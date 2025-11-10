'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-toastify'

interface Payment {
  id: string
  amount: number
  refund_amount?: number
  currency: string
}

interface RefundModalProps {
  open: boolean
  onClose: () => void
  payment: Payment | null
  onRefunded: () => void
}

export function RefundModal({ open, onClose, payment, onRefunded }: RefundModalProps) {
  const [loading, setLoading] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  if (!payment) return null

  const maxRefundAmount = payment.amount - (payment.refund_amount || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = parseFloat(refundAmount)
    if (!amount || amount <= 0) {
      toast.error('Refund amount must be greater than 0')
      return
    }

    if (amount > maxRefundAmount) {
      toast.error(`Refund amount cannot exceed €${maxRefundAmount.toFixed(2)}`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/payments/${payment.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason: reason || undefined,
          notes: notes || undefined,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund')
      }

      toast.success(data.message || 'Refund processed successfully')
      onRefunded()
      onClose()
      setRefundAmount('')
      setReason('')
      setNotes('')
    } catch (error: any) {
      console.error('Error processing refund:', error)
      toast.error(error.message || 'Failed to process refund')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Process a full or partial refund for this payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Original Amount</p>
                <p className="font-semibold text-lg">€{payment.amount.toFixed(2)} {payment.currency}</p>
              </div>
              <div>
                <p className="text-gray-500">Already Refunded</p>
                <p className="font-semibold text-lg">€{(payment.refund_amount || 0).toFixed(2)}</p>
              </div>
              <div className="col-span-2 pt-2 border-t">
                <p className="text-gray-500">Maximum Refund</p>
                <p className="font-semibold text-xl text-green-600">€{maxRefundAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="refund_amount">Refund Amount (€) *</Label>
            <Input
              id="refund_amount"
              type="number"
              step="0.01"
              min="0.01"
              max={maxRefundAmount}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder={`Max: €${maxRefundAmount.toFixed(2)}`}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum refundable: €{maxRefundAmount.toFixed(2)}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Refund Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer cancellation, Service issue..."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes about this refund..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Processing...' : 'Process Refund'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

