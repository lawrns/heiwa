'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Calendar, Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react'
import { BookingCalendar } from '@/components/ui/booking-calendar'
import { useBookingsRealtime } from '@/lib/hooks/useBookingsRealtime'
import { EditBookingModal } from '@/components/admin/bookings/EditBookingModal'
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
  const [view, setView] = useState<'table' | 'calendar'>('table')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Set up real-time updates
  useBookingsRealtime({
    onInsert: (newBooking) => {
      console.log('📥 New booking received:', newBooking)
      setBookings(prev => [newBooking, ...prev])
      setIsRealtimeConnected(true)
    },
    onUpdate: (updatedBooking) => {
      console.log('✏️ Booking updated:', updatedBooking)
      setBookings(prev =>
        prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      )
      setIsRealtimeConnected(true)
    },
    onDelete: (bookingId) => {
      console.log('🗑️ Booking deleted:', bookingId)
      setBookings(prev => prev.filter(b => b.id !== bookingId))
      setIsRealtimeConnected(true)
    },
    onError: (error) => {
      console.error('❌ Real-time error:', error)
      setIsRealtimeConnected(false)
    }
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

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.data.bookings || [])
      } else {
        setError('Failed to fetch bookings')
      }
    } catch (err) {
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

  const handleDelete = async (bookingId: string) => {
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

  const exportBookings = () => {
    const csvContent = [
      ['ID', 'Guest Name', 'Email', 'Phone', 'Type', 'Item', 'Check-in', 'Check-out', 'Guests', 'Total Price', 'Status', 'Payment Status', 'Created'],
      ...bookings.map(booking => [
        booking.id,
        booking.guest_name,
        booking.guest_email,
        booking.guest_phone,
        booking.type,
        booking.item_name,
        booking.check_in,
        booking.check_out,
        booking.guests.toString(),
        `€${booking.total_price}`,
        booking.status,
        booking.payment_status,
        booking.created_at
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Filter and search bookings
  const filteredBookings = bookings.filter(booking => {
    // Apply status filter
    if (filters.status !== 'all' && booking.status !== filters.status) return false
    // Apply type filter
    if (filters.type !== 'all' && booking.type !== filters.type) return false
    // Apply payment status filter
    if (filters.payment_status !== 'all' && booking.payment_status !== filters.payment_status) return false
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600 mt-2">Manage all bookings and reservations</p>
          <div className="flex items-center gap-2 mt-2">
            {isRealtimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                <span className="text-sm text-green-600">Real-time updates active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Real-time updates connecting...</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView(view === 'table' ? 'calendar' : 'table')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Calendar className="h-4 w-4" />
            {view === 'table' ? 'Calendar View' : 'Table View'}
          </button>
          <button
            onClick={exportBookings}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
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
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                        <div className="text-sm text-gray-500">{booking.item_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.guest_name}</div>
                        <div className="text-sm text-gray-500">{booking.guest_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.type === 'room' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.type === 'room' ? 'Room' : 'Surf Camp'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div>{booking.check_in}</div>
                      <div>{booking.check_out}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      €{booking.total_price}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View booking details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditBooking(booking)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Edit booking"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
              {selectedBooking.special_requests && (
                <div>
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="text-sm font-medium text-gray-900">{selectedBooking.special_requests}</p>
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
