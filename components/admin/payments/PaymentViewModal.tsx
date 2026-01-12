'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Calendar, Euro, FileText, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react'

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
  bookings?: {
    id: string
    total_amount: number
    payment_status: string
  }
}

interface PaymentViewModalProps {
  open: boolean
  onClose: () => void
  payment: Payment | null
  onEdit?: () => void
  onRefund?: () => void
}

export function PaymentViewModal({ open, onClose, payment, onEdit, onRefund }: PaymentViewModalProps) {
  if (!payment) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'refunded':
      case 'partially_refunded':
        return <RotateCcw className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
      case 'partially_refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      stripe: 'Stripe',
      cash: 'Cash',
      transfer: 'Bank Transfer',
      paypal: 'PayPal',
      other: 'Other'
    }
    return labels[method] || method
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const remainingAmount = payment.amount - (payment.refund_amount || 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Payment information and transaction history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(payment.payment_status)}
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                {payment.payment_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              {onRefund && payment.payment_status === 'completed' && remainingAmount > 0 && (
                <Button variant="outline" size="sm" onClick={onRefund}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Refund
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit Payment
                </Button>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Payment Amount</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Euro className="h-4 w-4" />
                {payment.amount.toFixed(2)} {payment.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="text-sm font-semibold">{getPaymentMethodLabel(payment.payment_method)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-sm font-mono">{payment.booking_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="text-sm font-mono">{payment.transaction_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(payment.payment_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm">{formatDate(payment.created_at)}</p>
            </div>
          </div>

          {/* Refund Information */}
          {(payment.refund_amount || 0) > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Refund Information
              </h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Refunded Amount</p>
                    <p className="font-semibold text-lg text-orange-600">
                      €{(payment.refund_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Remaining Amount</p>
                    <p className="font-semibold text-lg text-green-600">
                      €{remainingAmount.toFixed(2)}
                    </p>
                  </div>
                  {payment.refund_reason && (
                    <div className="col-span-2">
                      <p className="text-gray-500">Refund Reason</p>
                      <p className="font-medium">{payment.refund_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Booking Information */}
          {payment.bookings && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Booking Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Booking Total</p>
                  <p className="font-semibold">€{payment.bookings.total_amount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Booking Payment Status</p>
                  <p className="font-semibold">{payment.bookings.payment_status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{payment.notes}</p>
            </div>
          )}
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

