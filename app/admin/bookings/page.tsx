'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Wifi, WifiOff, Plus } from 'lucide-react'
import { BookingCalendar } from '@/components/ui/booking-calendar'
import { useBookingsRealtime } from '@/lib/hooks/useBookingsRealtime'
import { EditBookingModal } from '@/components/admin/bookings/EditBookingModal'
import { ViewBookingModal } from '@/components/admin/bookings/ViewBookingModal'
import { BulkActions } from '@/components/admin/BulkActions'
import { CheckboxCell } from '@/components/admin/CheckboxCell'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { toast } from 'react-toastify'
import { formatDateCompact, formatDateShort } from '@/lib/utils'

interface Participant {
  name?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dietaryRequirements?: string
  specialRequests?: string
}

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
  participants?: Participant[]
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
  const [totalBookings, setTotalBookings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const itemsPerPage = 25
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<{ type: 'created' | 'updated' | 'deleted'; show: boolean }>({ type: 'created', show: false })

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

  // Refetch bookings when filters, search, or page changes
  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.status, filters.type, filters.payment_status, searchTerm, dateRange.startDate, dateRange.endDate])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate pagination
      const offset = (currentPage - 1) * itemsPerPage
      
      // Build query params
      const params = new URLSearchParams()
      params.set('limit', itemsPerPage.toString())
      params.set('offset', offset.toString())
      
      if (filters.status !== 'all') {
        params.set('status', filters.status)
      }
      if (filters.type !== 'all') {
        params.set('type', filters.type)
      }
      if (filters.payment_status !== 'all') {
        params.set('payment_status', filters.payment_status)
      }
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      if (dateRange.startDate) {
        params.set('start_date', dateRange.startDate)
      }
      if (dateRange.endDate) {
        params.set('end_date', dateRange.endDate)
      }
      
      const response = await fetch(`/api/bookings?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        // Replace bookings with paginated results
        setBookings(data.data.bookings || [])
        // Store total count for pagination
        setTotalBookings(data.total || data.count || 0)
      } else {
        setError('Failed to fetch bookings')
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
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
      setSuccessMessage({ type: 'updated', show: true })
      setTimeout(() => setSuccessMessage(prev => ({ ...prev, show: false })), 3000)

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === updatedBooking.id ? updatedBooking : booking
      ))

      setShowEditModal(false)
      setSelectedBooking(null)
    } catch (error: unknown) {
      console.error('Error updating booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update booking'
      toast.error(errorMessage)
      throw error
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ))
        toast.success('Booking status updated successfully')
      } else {
        toast.error(data.error || 'Failed to update booking status')
      }
    } catch (err) {
      console.error('Error updating booking:', err)
      toast.error('Failed to update booking status')
    }
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookingToDelete(bookingId)
    setShowDeleteModal(true)
  }

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return

    try {
      const response = await fetch(`/api/bookings/${bookingToDelete}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete booking')
      }

      toast.success('Booking deleted successfully')
      setSuccessMessage({ type: 'deleted', show: true })
      setTimeout(() => setSuccessMessage(prev => ({ ...prev, show: false })), 3000)
      setBookings(bookings.filter(booking => booking.id !== bookingToDelete))
      setShowDeleteModal(false)
      setBookingToDelete(null)
      setShowViewModal(false)
    } catch (error: unknown) {
      console.error('Error deleting booking:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete booking'
      toast.error(errorMessage)
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
    } catch (error: unknown) {
      console.error('Error updating bookings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bookings'
      toast.error(errorMessage)
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
    } catch (error: unknown) {
      console.error('Error updating bookings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bookings'
      toast.error(errorMessage)
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
    } catch (error: unknown) {
      console.error('Error deleting bookings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete bookings'
      toast.error(errorMessage)
    }
  }

  const exportBookings = async () => {
    try {
      // Fetch all bookings for export (without pagination)
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.type !== 'all') params.set('type', filters.type)
      if (filters.payment_status !== 'all') params.set('payment_status', filters.payment_status)
      if (searchTerm) params.set('search', searchTerm)
      if (dateRange.startDate) params.set('start_date', dateRange.startDate)
      if (dateRange.endDate) params.set('end_date', dateRange.endDate)
      // No limit for export
      
      const response = await fetch(`/api/bookings?${params.toString()}`)
      const data = await response.json()
      const bookingsToExport = data.success ? (data.data.bookings || []) : bookings
      
      // Escape CSV values properly
      const escapeCsvValue = (value: unknown): string => {
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
        ...bookingsToExport.map((booking: Booking) => [
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
          escapeCsvValue(formatDateShort(booking.created_at))
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

  // Server-side pagination - bookings are already filtered and paginated
  const paginatedBookings = bookings
  const totalPages = Math.ceil(totalBookings / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

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
          <Link
            href="/admin/bookings/new"
            data-testid="create-booking-btn"
            className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none font-medium"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Booking</span>
            <span className="sm:hidden">New</span>
          </Link>
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
            <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
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
            <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {/* Search Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              data-testid="search-input"
              placeholder="Search by booking ID, guest name, email, phone, or item..."
              value={searchTerm}
              onChange={(e) => {
                const newSearch = e.target.value
                setSearchTerm(newSearch)
                setCurrentPage(1) // Reset to first page when searching
                updateUrlParams(1, newSearch, filters.status, filters.type, filters.payment_status)
              }}
              className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                data-testid="clear-search"
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                  updateUrlParams(1, '', filters.status, filters.type, filters.payment_status)
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              data-testid="status-filter"
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
              <option value="pending" data-testid="filter-pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              data-testid="experience-filter"
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
              <option value="surf_camp" data-testid="filter-surf-week">Surf Camps</option>
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
          bookings={bookings.map(booking => ({
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
              totalCount={totalBookings}
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
                Bookings ({totalBookings})
              </h3>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" data-testid="bookings-table">
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
                  <tr key={booking.id} data-testid="booking-row" className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <CheckboxCell
                        checked={selectedBookings.has(booking.id)}
                        onCheckedChange={(checked) => handleSelectBooking(booking.id, checked)}
                        data-testid="booking-checkbox"
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.type === 'room' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}
                        data-testid={booking.type === 'surf_camp' ? 'experience-surf-week' : undefined}
                      >
                        {booking.type === 'room' ? 'Room' : 'Surf Camp'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      <div>{formatDateCompact(booking.check_in)}</div>
                      <div>{formatDateCompact(booking.check_out)}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      €{booking.total_price.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          {getStatusIcon(booking.status)}
                          <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`} data-testid={`status-${booking.status}`}>
                            <span className="hidden sm:inline">{booking.status}</span>
                            <span className="sm:hidden">{booking.status.substring(0, 3)}</span>
                          </span>
                        </div>
                        {/* Always show payment status with clear label */}
                        <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                          <span className="hidden sm:inline">💰 {booking.payment_status}</span>
                          <span className="sm:hidden">💰 {booking.payment_status.substring(0, 3)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="View booking details"
                          data-testid="view-booking-btn"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-gray-600 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-50"
                          title="Edit booking"
                          data-testid="edit-booking-btn"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete booking"
                          data-testid="delete-booking-btn"
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalBookings)} of {totalBookings} bookings
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

      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">No bookings match your current filters.</p>
        </div>
      )}

      {/* Success Messages */}
      {successMessage.show && successMessage.type === 'created' && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" data-testid="booking-created-success">
          Booking created successfully!
        </div>
      )}
      {successMessage.show && successMessage.type === 'updated' && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" data-testid="booking-updated-success">
          Booking updated successfully!
        </div>
      )}
      {successMessage.show && successMessage.type === 'deleted' && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" data-testid="booking-deleted-success">
          Booking deleted successfully!
        </div>
      )}

      {/* View Booking Modal */}
      <ViewBookingModal
        isOpen={showViewModal}
        booking={selectedBooking}
        onClose={() => setShowViewModal(false)}
        onEdit={(booking) => {
          setShowViewModal(false)
          handleEditBooking(booking)
        }}
        onDelete={(bookingId) => {
          handleDeleteBooking(bookingId)
        }}
        onSendEmail={(booking) => {
          // TODO: Implement send email functionality
          toast.info(`Send email to ${booking.guest_email}`)
        }}
      />

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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="delete-confirmation-modal">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Booking</h3>
            <p className="text-gray-600 mb-6" data-testid="delete-warning-message">
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setBookingToDelete(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                data-testid="confirm-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
