'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import { BookingCalendar } from '@/components/ui/booking-calendar'
import { useBookingsRealtime } from '@/lib/hooks/useBookingsRealtime'
import { EditBookingModal } from '@/components/admin/bookings/EditBookingModal'
import { BulkActions } from '@/components/admin/BulkActions'
import { CheckboxCell } from '@/components/admin/CheckboxCell'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { toast } from 'react-toastify'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  type: 'room' | 'surf_camp'
  item_name: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
  special_requests?: string
  dietary_preferences?: string
  client_notes?: string
  notes?: string
  client_ids?: string[]
}

export default function BookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL params
  const initialPage = parseInt(searchParams.get('page') || '1')
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || 'all'
  const initialType = searchParams.get('type') || 'all'
  const initialPaymentStatus = searchParams.get('payment_status') || 'all'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const itemsPerPage = 10
  const [filters, setFilters] = useState({
    status: initialStatus,
    type: initialType,
    payment_status: initialPaymentStatus,
    date_range: 'all'
  })
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set())

  // Memoize callbacks to prevent re-subscription loops
  const handleInsert = useCallback((newBooking: Booking) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 New booking received:', newBooking)
    }
    // Check if booking already exists to prevent duplicates
    setBookings(prev => {
      const exists = prev.some(b => b.id === newBooking.id)
      if (exists) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Booking already exists, skipping duplicate:', newBooking.id)
        }
        return prev
      }
      return [newBooking, ...prev]
    })
  }, [])

  const handleUpdate = useCallback((updatedBooking: Booking) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✏️ Booking updated:', updatedBooking)
    }
    setBookings(prev =>
      prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    )
  }, [])

  const handleDelete = useCallback((bookingId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🗑️ Booking deleted:', bookingId)
    }
    setBookings(prev => prev.filter(b => b.id !== bookingId))
  }, [])

  const handleError = useCallback((error: Error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Real-time error:', error)
    }
    setIsRealtimeConnected(false)
  }, [])

  const handleConnect = useCallback((connected: boolean) => {
    setIsRealtimeConnected(connected)
  }, [])

  // Set up real-time updates with memoized callbacks
  useBookingsRealtime({
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onError: handleError,
    onConnect: handleConnect
  })

  // Update URL when state changes
  const updateUrlParams = useCallback((
    page?: number,
    search?: string,
    status?: string,
    type?: string,
    paymentStatus?: string
  ) => {
    const params = new URLSearchParams()
    
    if (page && page > 1) params.set('page', page.toString())
    if (search) params.set('search', search)
    if (status && status !== 'all') params.set('status', status)
    if (type && type !== 'all') params.set('type', type)
    if (paymentStatus && paymentStatus !== 'all') params.set('payment_status', paymentStatus)
    
    const queryString = params.toString()
    router.push(`/admin/bookings${queryString ? '?' + queryString : ''}`, { scroll: false })
  }, [router])

  const [bookingsFetched, setBookingsFetched] = useState(false)

  useEffect(() => {
    if (!bookingsFetched) {
      fetchBookings()
      setBookingsFetched(true)
    }
  }, [bookingsFetched])

  const fetchBookings = async () => {
    try {
      // Fetch all bookings (no limit) for accurate counts
      const response = await fetch('/api/bookings?limit=10000')
      const data = await response.json()
      
      if (data.success) {
        // Replace all bookings to avoid duplicates from realtime updates
        setBookings(data.data.bookings || [])
      } else {
        setError('Failed to fetch bookings')
      }
    } catch {
      setError('Error loading bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowViewModal(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowEditModal(true)
  }

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      const response = await fetch(`/api/bookings/${updatedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBooking)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking')
      }

      toast.success('Booking updated successfully')
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === updatedBooking.id ? updatedBooking : booking
      ))
      
      setShowEditModal(false)
      setSelectedBooking(null)
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast.error(error.message || 'Failed to update booking')
      throw error
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      // In a real implementation, this would be a PATCH request
      console.log('Updating booking status:', bookingId, newStatus)
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ))
    } catch (err) {
      console.error('Error updating booking:', err)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking')
      }

      toast.success('Booking deleted successfully')
      setBookings(bookings.filter(booking => booking.id !== bookingId))
    } catch (error: any) {
      console.error('Error deleting booking:', error)
      toast.error(error.message || 'Failed to delete booking')
    }
  }

  // Bulk operations handlers
  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    setSelectedBookings(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(bookingId)
      } else {
        newSet.delete(bookingId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedBookings(new Set(paginatedBookings.map(b => b.id)))
  }

  const handleDeselectAll = () => {
    setSelectedBookings(new Set())
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedBookings.size === 0) return

    if (!confirm(`Update ${selectedBookings.size} booking(s) to ${status}?`)) return

    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          bookingIds: Array.from(selectedBookings),
          status,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Updated ${selectedBookings.size} booking(s)`)
        setSelectedBookings(new Set())
        fetchBookings()
      } else {
        throw new Error(data.error || 'Failed to update bookings')
      }
    } catch (error: any) {
      console.error('Error updating bookings:', error)
      toast.error(error.message || 'Failed to update bookings')
    }
  }

  const handleBulkPaymentStatusUpdate = async (paymentStatus: string) => {
    if (selectedBookings.size === 0) return

    if (!confirm(`Update payment status for ${selectedBookings.size} booking(s) to ${paymentStatus}?`)) return

    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_payment_status',
          bookingIds: Array.from(selectedBookings),
          payment_status: paymentStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Updated ${selectedBookings.size} booking(s)`)
        setSelectedBookings(new Set())
        fetchBookings()
      } else {
        throw new Error(data.error || 'Failed to update bookings')
      }
    } catch (error: any) {
      console.error('Error updating bookings:', error)
      toast.error(error.message || 'Failed to update bookings')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedBookings.size === 0) return

    if (!confirm(`Delete ${selectedBookings.size} booking(s)? This action cannot be undone.`)) return

    try {
      const response = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          bookingIds: Array.from(selectedBookings),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Deleted ${selectedBookings.size} booking(s)`)
        setSelectedBookings(new Set())
        fetchBookings()
      } else {
        throw new Error(data.error || 'Failed to delete bookings')
      }
    } catch (error: any) {
      console.error('Error deleting bookings:', error)
      toast.error(error.message || 'Failed to delete bookings')
    }
  }

  const exportBookings = () => {
    try {
      // Use filtered bookings for export, not all bookings
      const bookingsToExport = filteredBookings.length > 0 ? filteredBookings : bookings
      
      // Escape CSV values properly
      const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }

      const csvContent = [
        ['ID', 'Guest Name', 'Email', 'Phone', 'Type', 'Item', 'Check-in', 'Check-out', 'Guests', 'Total Price', 'Status', 'Payment Status', 'Created'],
        ...bookingsToExport.map(booking => [
          escapeCsvValue(booking.id),
          escapeCsvValue(booking.guest_name),
          escapeCsvValue(booking.guest_email),
          escapeCsvValue(booking.guest_phone),
          escapeCsvValue(booking.type),
          escapeCsvValue(booking.item_name),
          escapeCsvValue(booking.check_in),
          escapeCsvValue(booking.check_out),
          escapeCsvValue(booking.guests),
          escapeCsvValue(`€${booking.total_price}`),
          escapeCsvValue(booking.status),
          escapeCsvValue(booking.payment_status),
          escapeCsvValue(new Date(booking.created_at).toLocaleDateString())
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success(`Exported ${bookingsToExport.length} booking(s) to CSV`)
    } catch (error) {
      console.error('Error exporting bookings:', error)
      toast.error('Failed to export bookings')
    }
  }

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    // Apply status filter
    if (filters.status !== 'all' && booking.status !== filters.status) return false
    // Apply type filter
    if (filters.type !== 'all' && booking.type !== filters.type) return false
    // Apply payment status filter
    if (filters.payment_status !== 'all' && booking.payment_status !== filters.payment_status) return false
    // Apply date range filter
    if (dateRange.startDate || dateRange.endDate) {
      const checkInDate = new Date(booking.check_in)
      if (dateRange.startDate && checkInDate < new Date(dateRange.startDate)) return false
      if (dateRange.endDate && checkInDate > new Date(dateRange.endDate)) return false
    }
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        booking.id.toLowerCase().includes(searchLower) ||
        booking.guest_name.toLowerCase().includes(searchLower) ||
        booking.guest_email.toLowerCase().includes(searchLower) ||
        booking.guest_phone.toLowerCase().includes(searchLower) ||
        booking.item_name.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }
    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage)

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPaymentStatusColor = (status: Booking['payment_status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'refunded':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all bookings and reservations</p>
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
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage all bookings and reservations</p>
          <div className="flex items-center gap-2 mt-2">
            {isRealtimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-xs sm:text-sm text-green-600">Real-time updates active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-500">Real-time updates connecting...</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <button
            onClick={() => setView(view === 'table' ? 'calendar' : 'table')}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{view === 'table' ? 'Calendar View' : 'Table View'}</span>
            <span className="sm:hidden">{view === 'table' ? 'Calendar' : 'Table'}</span>
          </button>
          <button
            onClick={exportBookings}
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-yellow-100 text-yellow-600 rounded-full p-3">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-purple-100 text-purple-600 rounded-full p-3">
            <Filter size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Filtered</p>
            <p className="text-2xl font-bold text-gray-900">{filteredBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search by booking ID, guest name, email, phone, or item..."
            value={searchTerm}
            onChange={(e) => {
              const newSearch = e.target.value
              setSearchTerm(newSearch)
              setCurrentPage(1) // Reset to first page when searching
              updateUrlParams(1, newSearch, filters.status, filters.type, filters.payment_status)
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                const newStatus = e.target.value
                setFilters(prev => ({ ...prev, status: newStatus }))
                setCurrentPage(1)
                updateUrlParams(1, searchTerm, newStatus, filters.type, filters.payment_status)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => {
                const newType = e.target.value
                setFilters(prev => ({ ...prev, type: newType }))
                setCurrentPage(1)
                updateUrlParams(1, searchTerm, filters.status, newType, filters.payment_status)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="room">Rooms</option>
              <option value="surf_camp">Surf Camps</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
            <select
              value={filters.payment_status}
              onChange={(e) => {
                const newPaymentStatus = e.target.value
                setFilters(prev => ({ ...prev, payment_status: newPaymentStatus }))
                setCurrentPage(1)
                updateUrlParams(1, searchTerm, filters.status, filters.type, newPaymentStatus)
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mt-4">
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
            label="Filter by Check-in Date"
          />
        </div>
      </div>

      {/* Calendar or Table View */}
      {view === 'calendar' ? (
        <BookingCalendar 
          bookings={filteredBookings.map(booking => ({
            id: booking.id,
            customerName: booking.guest_name,
            type: booking.type === 'surf_camp' ? 'surf-week' : 'room',
            item: booking.item_name,
            checkIn: booking.check_in,
            checkOut: booking.check_out,
            guests: booking.guests,
            totalPrice: booking.total_price,
            status: booking.status === 'confirmed' ? 'Confirmed' : 
                   booking.status === 'cancelled' ? 'Cancelled' : 'Pending'
          }))}
          onBookingClick={(booking) => console.log('Booking clicked:', booking)}
        />
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {selectedBookings.size > 0 && (
            <BulkActions
              selectedCount={selectedBookings.size}
              totalCount={filteredBookings.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              actions={[
                {
                  label: 'Mark Confirmed',
                  onClick: () => handleBulkStatusUpdate('confirmed'),
                },
                {
                  label: 'Mark Cancelled',
                  onClick: () => handleBulkStatusUpdate('cancelled'),
                },
                {
                  label: 'Mark Paid',
                  onClick: () => handleBulkPaymentStatusUpdate('paid'),
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

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Bookings ({filteredBookings.length})
              </h3>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <CheckboxCell
                        checked={paginatedBookings.length > 0 && paginatedBookings.every(b => selectedBookings.has(b.id))}
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
                      Booking
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings.map((booking, index) => (
                  <tr key={booking.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <CheckboxCell
                        checked={selectedBookings.has(booking.id)}
                        onCheckedChange={(checked) => handleSelectBooking(booking.id, checked)}
                      />
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap hidden sm:table-cell">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">#{booking.id.substring(0, 8)}...</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px]">{booking.item_name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div>
                        {booking.client_ids && booking.client_ids.length > 0 ? (
                          <Link 
                            href={`/admin/clients?search=${encodeURIComponent(booking.guest_email || booking.guest_name)}`}
                            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {booking.guest_name}
                          </Link>
                        ) : (
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        )}
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{booking.guest_email}</div>
                        <div className="text-xs text-gray-400 sm:hidden mt-1">{booking.item_name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.type === 'room' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.type === 'room' ? 'Room' : 'Surf Camp'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      <div>{booking.check_in ? new Date(booking.check_in).toLocaleDateString() : 'N/A'}</div>
                      <div>{booking.check_out ? new Date(booking.check_out).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      €{booking.total_price.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getStatusIcon(booking.status)}
                          <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            <span className="hidden sm:inline">{booking.status}</span>
                            <span className="sm:hidden">{booking.status.substring(0, 3)}</span>
                          </span>
                        </div>
                        {booking.payment_status && booking.payment_status !== booking.status && (
                          <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                            <span className="hidden sm:inline">Payment: {booking.payment_status}</span>
                            <span className="sm:hidden">{booking.payment_status.substring(0, 3)}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View booking details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50"
                          title="Edit booking"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete booking"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    updateUrlParams(newPage, searchTerm, filters.status, filters.type, filters.payment_status)
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page)
                      updateUrlParams(page, searchTerm, filters.status, filters.type, filters.payment_status)
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    updateUrlParams(newPage, searchTerm, filters.status, filters.type, filters.payment_status)
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">No bookings match your current filters.</p>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guest Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Item</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.item_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-in</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.check_in}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.check_out}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Price</p>
                  <p className="text-sm font-medium text-gray-900">€{selectedBooking.total_price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.payment_status}</p>
                </div>
              </div>
              {selectedBooking.dietary_preferences && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Dietary Preferences</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.dietary_preferences}</p>
                </div>
              )}
              {selectedBooking.special_requests && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedBooking.special_requests}</p>
                </div>
              )}
              {selectedBooking.client_notes && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">Client Notes</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{selectedBooking.client_notes}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <EditBookingModal
          isOpen={showEditModal}
          booking={selectedBooking}
          onClose={() => {
            setShowEditModal(false)
            setSelectedBooking(null)
          }}
          onSubmit={handleUpdateBooking}
        />
      )}
    </div>
  )
}
