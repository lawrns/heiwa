'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FileText, Plus, Eye, Edit, Trash2, Search } from 'lucide-react'
import { InvoiceModal } from '@/components/admin/invoices/InvoiceModal'
import { InvoiceViewModal } from '@/components/admin/invoices/InvoiceViewModal'
import { BulkActions } from '@/components/admin/BulkActions'
import { CheckboxCell } from '@/components/admin/CheckboxCell'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { AmountRangeFilter } from '@/components/admin/AmountRangeFilter'
import { toast } from 'react-toastify'
import { formatDateCompact } from '@/lib/utils'

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
  }
}

export default function InvoicesPage() {
  const searchParams = useSearchParams()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [amountRange, setAmountRange] = useState({ minAmount: '', maxAmount: '' })
  const itemsPerPage = 20

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        if (searchTerm) params.set('search', searchTerm)
        params.set('page', currentPage.toString())
        params.set('limit', itemsPerPage.toString())

        const response = await fetch(`/api/invoices?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setInvoices(data.data.invoices || [])
        } else {
          setError('Failed to fetch invoices')
        }
      } catch (err) {
        setError('Error loading invoices')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [statusFilter, currentPage, searchTerm])

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewModal(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowEditModal(true)
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Invoice deleted successfully')
        fetchInvoices()
      } else {
        throw new Error(data.error || 'Failed to delete invoice')
      }
    } catch (error: unknown) {
      console.error('Error deleting invoice:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete invoice'
      toast.error(errorMessage)
    }
  }

  // Bulk operations handlers
  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    setSelectedInvoices(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(invoiceId)
      } else {
        newSet.delete(invoiceId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedInvoices(new Set(filteredInvoices.map(i => i.id)))
  }

  const handleDeselectAll = () => {
    setSelectedInvoices(new Set())
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedInvoices.size === 0) return

    if (!confirm(`Update ${selectedInvoices.size} invoice(s) to ${status}?`)) return

    try {
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          invoiceIds: Array.from(selectedInvoices),
          status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Updated ${selectedInvoices.size} invoice(s)`)
        setSelectedInvoices(new Set())
        fetchInvoices()
      } else {
        throw new Error(data.error || 'Failed to update invoices')
      }
    } catch (error: unknown) {
      console.error('Error updating invoices:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update invoices'
      toast.error(errorMessage)
    }
  }

  const handleBulkSend = async () => {
    if (selectedInvoices.size === 0) return

    if (!confirm(`Send ${selectedInvoices.size} invoice(s) to clients?`)) return

    try {
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          invoiceIds: Array.from(selectedInvoices),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Sent ${selectedInvoices.size} invoice(s)`)
        setSelectedInvoices(new Set())
        fetchInvoices()
      } else {
        throw new Error(data.error || 'Failed to send invoices')
      }
    } catch (error: unknown) {
      console.error('Error sending invoices:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invoices'
      toast.error(errorMessage)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedInvoices.size === 0) return

    if (!confirm(`Delete ${selectedInvoices.size} invoice(s)? This action cannot be undone.`)) return

    try {
      const response = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          invoiceIds: Array.from(selectedInvoices),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Deleted ${selectedInvoices.size} invoice(s)`)
        setSelectedInvoices(new Set())
        fetchInvoices()
      } else {
        throw new Error(data.error || 'Failed to delete invoices')
      }
    } catch (error: unknown) {
      console.error('Error deleting invoices:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete invoices'
      toast.error(errorMessage)
    }
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

  const filteredInvoices = invoices.filter(invoice => {
    // Apply status filter
    if (statusFilter !== 'all' && invoice.status !== statusFilter) return false
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchLower) ||
        invoice.booking_id.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    
    // Apply date range filter (due date)
    if (dateRange.startDate || dateRange.endDate) {
      if (invoice.due_date) {
        const dueDate = new Date(invoice.due_date)
        if (dateRange.startDate && dueDate < new Date(dateRange.startDate)) return false
        if (dateRange.endDate && dueDate > new Date(dateRange.endDate)) return false
      }
    }
    
    // Apply amount range filter
    if (amountRange.minAmount || amountRange.maxAmount) {
      const amount = invoice.amount
      if (amountRange.minAmount && amount < parseFloat(amountRange.minAmount)) return false
      if (amountRange.maxAmount && amount > parseFloat(amountRange.maxAmount)) return false
    }
    
    return true
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">Manage all invoices</p>
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
            onClick={fetchInvoices}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage all invoices and billing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Paid</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoices.filter(i => i.status === 'paid').length}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-yellow-100 text-yellow-600 rounded-full p-3">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoices.filter(i => i.status === 'draft' || i.status === 'sent').length}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-red-100 text-red-600 rounded-full p-3">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Overdue</p>
            <p className="text-2xl font-bold text-gray-900">
              {invoices.filter(i => i.status === 'overdue').length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <div className="flex-1 min-w-full sm:min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number or booking ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
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
            label="Filter by Due Date"
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
      {selectedInvoices.size > 0 && (
        <BulkActions
          selectedCount={selectedInvoices.size}
          totalCount={filteredInvoices.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          actions={[
            {
              label: 'Mark Paid',
              onClick: () => handleBulkStatusUpdate('paid'),
            },
            {
              label: 'Mark Sent',
              onClick: () => handleBulkStatusUpdate('sent'),
            },
            {
              label: 'Send Emails',
              onClick: handleBulkSend,
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

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Invoices ({filteredInvoices.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <CheckboxCell
                    checked={filteredInvoices.length > 0 && filteredInvoices.every(i => selectedInvoices.has(i.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSelectAll()
                      } else {
                        handleDeselectAll()
                      }
                    }}
                  />
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Booking ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Due Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <CheckboxCell
                      checked={selectedInvoices.has(invoice.id)}
                      onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked)}
                    />
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                    <div className="text-xs text-gray-500 font-mono sm:hidden mt-1">{invoice.booking_id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="text-sm text-gray-500 font-mono">{invoice.booking_id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      €{invoice.amount.toFixed(2)} {invoice.currency}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {formatDateCompact(invoice.due_date)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {formatDateCompact(invoice.created_at)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit invoice"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first invoice.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <InvoiceModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSaved={fetchInvoices}
        />
      )}

      {showEditModal && selectedInvoice && (
        <InvoiceModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedInvoice(null)
          }}
          invoice={selectedInvoice}
          onSaved={fetchInvoices}
        />
      )}

      {showViewModal && selectedInvoice && (
        <InvoiceViewModal
          open={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedInvoice(null)
          }}
          invoice={selectedInvoice}
          onEdit={() => {
            setShowViewModal(false)
            handleEditInvoice(selectedInvoice)
          }}
        />
      )}
    </div>
  )
}

