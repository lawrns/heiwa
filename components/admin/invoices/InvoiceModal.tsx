'use client'

import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Calendar, Search, ChevronDown } from 'lucide-react'
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

interface BookingOption {
  id: string
  guest_name: string
  guest_email: string
  total_price: number
  check_in: string
  check_out: string
  item_name: string
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
  const [bookings, setBookings] = useState<BookingOption[]>([])
  const [bookingSearch, setBookingSearch] = useState('')
  const [showBookingDropdown, setShowBookingDropdown] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(false)
  
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
  const [selectedBooking, setSelectedBooking] = useState<BookingOption | null>(null)

  // Fetch all bookings for dropdown
  useEffect(() => {
    if (open && !invoice) {
      fetchAllBookings()
    }
  }, [open, invoice])

  // Fetch single booking if we have a booking_id
  useEffect(() => {
    if (open && formData.booking_id && !selectedBooking) {
      fetchSingleBooking()
    }
  }, [open, formData.booking_id])

  const fetchAllBookings = async () => {
    try {
      setLoadingBookings(true)
      const response = await fetch('/api/bookings?limit=100')
      const data = await response.json()
      if (data.success && data.data?.bookings) {
        setBookings(data.data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchSingleBooking = async () => {
    try {
      const response = await fetch(`/api/bookings?id=${formData.booking_id}`)
      const data = await response.json()
      if (data.success && data.data?.bookings?.[0]) {
        const booking = data.data.bookings[0]
        setSelectedBooking(booking)
        if (!invoice && !formData.amount) {
          setFormData(prev => ({ ...prev, amount: booking.total_price || 0 }))
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    }
  }

  // Filter bookings based on search
  const filteredBookings = useMemo(() => {
    if (!bookingSearch) return bookings
    const search = bookingSearch.toLowerCase()
    return bookings.filter(b => 
      b.guest_name?.toLowerCase().includes(search) ||
      b.guest_email?.toLowerCase().includes(search) ||
      b.id.toLowerCase().includes(search) ||
      b.item_name?.toLowerCase().includes(search)
    )
  }, [bookings, bookingSearch])

  const handleSelectBooking = (booking: BookingOption) => {
    setFormData(prev => ({
      ...prev,
      booking_id: booking.id,
      amount: booking.total_price || 0,
    }))
    setSelectedBooking(booking)
    setShowBookingDropdown(false)
    setBookingSearch('')
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
    } catch (error: unknown) {
      console.error('Error saving invoice:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save invoice'
      toast.error(errorMessage)
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
            
            {invoice ? (
              // When editing, show read-only booking ID
              <div>
                <Label htmlFor="booking_id">Booking ID</Label>
                <Input
                  id="booking_id"
                  value={formData.booking_id}
                  disabled
                  className="mt-1.5 bg-gray-50"
                />
              </div>
            ) : (
              // When creating, show searchable dropdown
              <div className="relative">
                <Label>Select Booking *</Label>
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => setShowBookingDropdown(!showBookingDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white text-left hover:border-gray-400 focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedBooking ? (
                      <span className="text-gray-900">
                        {selectedBooking.guest_name} - {selectedBooking.item_name} (€{selectedBooking.total_price})
                      </span>
                    ) : (
                      <span className="text-gray-500">Select a booking...</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {showBookingDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={bookingSearch}
                            onChange={(e) => setBookingSearch(e.target.value)}
                            placeholder="Search by name, email, or ID..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {loadingBookings ? (
                          <div className="p-4 text-center text-gray-500">Loading bookings...</div>
                        ) : filteredBookings.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">No bookings found</div>
                        ) : (
                          filteredBookings.map((booking) => (
                            <button
                              key={booking.id}
                              type="button"
                              onClick={() => handleSelectBooking(booking)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-900">{booking.guest_name}</div>
                                  <div className="text-sm text-gray-500">{booking.guest_email}</div>
                                  <div className="text-xs text-gray-400">{booking.item_name}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">€{booking.total_price}</div>
                                  <span className={`inline-flex px-1.5 py-0.5 text-xs rounded-full ${
                                    booking.payment_status === 'paid' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {booking.payment_status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Manual entry fallback */}
                <div className="mt-2">
                  <details className="text-sm">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                      Or enter booking ID manually
                    </summary>
                    <Input
                      value={formData.booking_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, booking_id: e.target.value }))}
                      placeholder="Enter booking ID"
                      className="mt-2"
                    />
                  </details>
                </div>
              </div>
            )}
            
            {selectedBooking && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Booking Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Guest:</span>
                    <span className="ml-1 text-blue-900">{selectedBooking.guest_name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Email:</span>
                    <span className="ml-1 text-blue-900">{selectedBooking.guest_email}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Item:</span>
                    <span className="ml-1 text-blue-900">{selectedBooking.item_name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Total:</span>
                    <span className="ml-1 text-blue-900 font-semibold">€{selectedBooking.total_price}</span>
                  </div>
                </div>
              </div>
            )}
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' }))}
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

