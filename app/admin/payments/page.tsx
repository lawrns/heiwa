'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreditCard, Plus, Eye, Edit, Trash2, Search, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PaymentModal } from '@/components/admin/payments/PaymentModal'
import { PaymentViewModal } from '@/components/admin/payments/PaymentViewModal'
import { RefundModal } from '@/components/admin/payments/RefundModal'
import { BulkActions } from '@/components/admin/BulkActions'
import { CheckboxCell } from '@/components/admin/CheckboxCell'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { AmountRangeFilter } from '@/components/admin/AmountRangeFilter'
import { toast } from 'react-toastify'
import { formatDateCompact } from '@/lib/utils'

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

export default function PaymentsPage() {
  const searchParams = useSearchParams()
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [methodFilter, setMethodFilter] = useState(searchParams.get('method') || 'all')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [amountRange, setAmountRange] = useState({ minAmount: '', maxAmount: '' })
  const itemsPerPage = 20

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (methodFilter !== 'all') params.set('payment_method', methodFilter)
      if (searchTerm) params.set('search', searchTerm)
      params.set('page', currentPage.toString())
      params.set('limit', itemsPerPage.toString())

      const response = await fetch(`/api/payments?${params.toString()}`, {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        setPayments(data.data.payments || [])
      } else {
        setError('Failed to fetch payments')
      }
    } catch (err) {
      setError('Error loading payments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, methodFilter, currentPage, searchTerm])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowEditModal(true)
  }

  const handleRefundPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowRefundModal(true)
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment?')) return

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Payment deleted successfully')
        fetchPayments()
      } else {
        throw new Error(data.error || 'Failed to delete payment')
      }
    } catch (error: unknown) {
      console.error('Error deleting payment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payment'
      toast.error(errorMessage)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
      case 'partially_refunded':
        return <RotateCcw className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
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
      transfer: 'Transfer',
      paypal: 'PayPal',
      other: 'Other'
    }
    return labels[method] || method
  }

  // Bulk operations handlers
  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    setSelectedPayments(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(paymentId)
      } else {
        newSet.delete(paymentId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedPayments(new Set(payments.map(p => p.id)))
  }

  const handleDeselectAll = () => {
    setSelectedPayments(new Set())
  }

  const handleBulkStatusUpdate = async (paymentStatus: string) => {
    if (selectedPayments.size === 0) return

    if (!confirm(`Update ${selectedPayments.size} payment(s) to ${paymentStatus}?`)) return

    try {
      const response = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_status',
          paymentIds: Array.from(selectedPayments),
          payment_status: paymentStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Updated ${selectedPayments.size} payment(s)`)
        setSelectedPayments(new Set())
        fetchPayments()
      } else {
        throw new Error(data.error || 'Failed to update payments')
      }
    } catch (error: unknown) {
      console.error('Error updating payments:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update payments'
      toast.error(errorMessage)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPayments.size === 0) return

    if (!confirm(`Delete ${selectedPayments.size} payment(s)? This action cannot be undone.`)) return

    try {
      const response = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'delete',
          paymentIds: Array.from(selectedPayments),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Deleted ${selectedPayments.size} payment(s)`)
        setSelectedPayments(new Set())
        fetchPayments()
      } else {
        throw new Error(data.error || 'Failed to delete payments')
      }
    } catch (error: unknown) {
      console.error('Error deleting payments:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete payments'
      toast.error(errorMessage)
    }
  }

  const filteredPayments = payments.filter(payment => {
    // Apply status filter
    if (statusFilter !== 'all' && payment.payment_status !== statusFilter) return false
    
    // Apply method filter
    if (methodFilter !== 'all' && payment.payment_method !== methodFilter) return false
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        payment.transaction_id?.toLowerCase().includes(searchLower) ||
        payment.booking_id.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    
    // Apply date range filter (payment date)
    if (dateRange.startDate || dateRange.endDate) {
      if (payment.payment_date) {
        const paymentDate = new Date(payment.payment_date)
        if (dateRange.startDate && paymentDate < new Date(dateRange.startDate)) return false
        if (dateRange.endDate && paymentDate > new Date(dateRange.endDate)) return false
      }
    }
    
    // Apply amount range filter
    if (amountRange.minAmount || amountRange.maxAmount) {
      const amount = payment.amount
      if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
      if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
    }
    
    return true
  })

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRefunded = payments.reduce((sum, p) => sum + (p.refund_amount || 0), 0)
  const netAmount = totalAmount - totalRefunded

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage all payment transactions</p>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage all payment transactions and refunds</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">€{totalAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-orange-100 text-orange-600 rounded-full p-3">
            <RotateCcw size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Refunded</p>
            <p className="text-2xl font-bold text-gray-900">€{totalRefunded.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-purple-100 text-purple-600 rounded-full p-3">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Net Amount</p>
            <p className="text-2xl font-bold text-gray-900">€{netAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID or booking ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="partially_refunded">Partially Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Methods</option>
              <option value="stripe">Stripe</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onStartDateChange={(date) => {
              setDateRange(prev => ({ ...prev, startDate: date }))
              setCurrentPage(1)
            }}
            onEndDateChange={(date) => {
              setDateRange(prev => ({ ...prev, endDate: date }))
              setCurrentPage(1)
            }}
            label="Filter by Payment Date"
          />
          <AmountRangeFilter
            minAmount={amountRange.minAmount}
            maxAmount={amountRange.maxAmount}
            onMinAmountChange={(amount) => {
              setAmountRange(prev => ({ ...prev, minAmount: amount }))
              setCurrentPage(1)
            }}
            onMaxAmountChange={(amount) => {
              setAmountRange(prev => ({ ...prev, maxAmount: amount }))
              setCurrentPage(1)
            }}
            label="Filter by Amount"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedPayments.size > 0 && (
        <BulkActions
          selectedCount={selectedPayments.size}
          totalCount={payments.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          actions={[
            {
              label: 'Mark Completed',
              onClick: () => handleBulkStatusUpdate('completed'),
            },
            {
              label: 'Mark Failed',
              onClick: () => handleBulkStatusUpdate('failed'),
            },
            {
              label: 'Delete',
              onClick: handleBulkDelete,
              variant: 'destructive',
            },
          ]}
          className="mb-4"
        />
      )}

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Payments ({filteredPayments.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <CheckboxCell
                    checked={payments.length > 0 && payments.every(p => selectedPayments.has(p.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSelectAll()
                      } else {
                        handleDeselectAll()
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const remainingAmount = payment.amount - (payment.refund_amount || 0)
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CheckboxCell
                        checked={selectedPayments.has(payment.id)}
                        onCheckedChange={(checked) => handleSelectPayment(payment.id, checked)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.transaction_id || 'N/A'}
                      </div>
                      {payment.refund_amount && payment.refund_amount > 0 && (
                        <div className="text-xs text-orange-600">
                          Refunded: €{payment.refund_amount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{payment.booking_id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{payment.amount.toFixed(2)} {payment.currency}
                      </div>
                      {remainingAmount < payment.amount && (
                        <div className="text-xs text-gray-500">
                          Remaining: €{remainingAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.payment_status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                          {payment.payment_status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateCompact(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewPayment(payment)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View payment"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit payment"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {payment.payment_status === 'completed' && remainingAmount > 0 && (
                          <button
                            onClick={() => handleRefundPayment(payment)}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Refund payment"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600 mb-4">Get started by recording your first payment.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <PaymentModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={fetchPayments}
        />
      )}

      {showEditModal && selectedPayment && (
        <PaymentModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPayment(null)
          }}
          payment={selectedPayment}
          onSaved={fetchPayments}
        />
      )}

      {showViewModal && selectedPayment && (
        <PaymentViewModal
          open={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedPayment(null)
          }}
          payment={selectedPayment}
          onEdit={() => {
            setShowViewModal(false)
            handleEditPayment(selectedPayment)
          }}
          onRefund={() => {
            setShowViewModal(false)
            handleRefundPayment(selectedPayment)
          }}
        />
      )}

      {showRefundModal && selectedPayment && (
        <RefundModal
          open={showRefundModal}
          onClose={() => {
            setShowRefundModal(false)
            setSelectedPayment(null)
          }}
          payment={selectedPayment}
          onRefunded={fetchPayments}
        />
      )}
    </div>
  )
}

