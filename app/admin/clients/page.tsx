'use client'

import { useState, useEffect } from 'react'
import { Users, Download, Plus, Eye, Edit, Trash2, Mail, Phone, Star } from 'lucide-react'
import { ViewClientModal } from '@/components/admin/clients/ViewClientModal'
import { CreateClientModal } from '@/components/admin/clients/CreateClientModal'
import { EditClientModal } from '@/components/admin/clients/EditClientModal'
import { BulkActions } from '@/components/admin/BulkActions'
import { CheckboxCell } from '@/components/admin/CheckboxCell'
import { toast } from 'react-toastify'
import { formatDateCompact } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  vip: boolean
  totalBookings: number
  totalSpent: number
  joinDate: string
  lastBooking?: string
  notes?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const itemsPerPage = 10

  useEffect(() => {
    fetchClients()
  }, [])

  // Filter by search term
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/clients')
      const data = await response.json()

      if (data.success) {
        setClients(data.clients || [])
      } else {
        setError(data.error || 'Failed to fetch clients')
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Failed to load clients. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete client')
      }

      toast.success('Client deleted successfully')
      fetchClients()
    } catch (error: unknown) {
      console.error('Error deleting client:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete client')
    }
  }

  const handleSelectClient = (clientId: string, checked: boolean) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(clientId)
      } else {
        newSet.delete(clientId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    setSelectedClients(new Set(paginatedClients.map(c => c.id)))
  }

  const handleDeselectAll = () => {
    setSelectedClients(new Set())
  }

  const handleBulkVipToggle = async (vip: boolean) => {
    if (selectedClients.size === 0) return

    if (!confirm(`${vip ? 'Mark' : 'Unmark'} ${selectedClients.size} client(s) as VIP?`)) return

    try {
      const response = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_vip',
          clientIds: Array.from(selectedClients),
          vip,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Updated ${selectedClients.size} client(s)`)
        setSelectedClients(new Set())
        fetchClients()
      } else {
        throw new Error(data.error || 'Failed to update clients')
      }
    } catch (error: unknown) {
      console.error('Error updating clients:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update clients')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return

    if (!confirm(`Delete ${selectedClients.size} client(s)? This action cannot be undone.`)) return

    try {
      const response = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          clientIds: Array.from(selectedClients),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || `Deleted ${selectedClients.size} client(s)`)
        setSelectedClients(new Set())
        fetchClients()
      } else {
        throw new Error(data.error || 'Failed to delete clients')
      }
    } catch (error: unknown) {
      console.error('Error deleting clients:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete clients')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage and view all client information</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors font-medium"
          data-testid="create-client-btn"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Total Clients</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">VIP Clients</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{clients.filter(c => c.vip).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">€{clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-500 text-sm">Avg. Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length > 0 ? (clients.reduce((sum, c) => sum + c.totalBookings, 0) / clients.length).toFixed(1) : '0'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent"
              data-testid="search-input"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedClients.size > 0 && (
        <BulkActions
          selectedCount={selectedClients.size}
          totalCount={filteredClients.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          actions={[
            {
              label: 'Mark VIP',
              onClick: () => handleBulkVipToggle(true),
            },
            {
              label: 'Remove VIP',
              onClick: () => handleBulkVipToggle(false),
            },
            {
              label: 'Delete',
              onClick: handleBulkDelete,
              variant: 'destructive',
            },
          ]}
        />
      )}

      {/* Clients Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" data-testid="clients-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <CheckboxCell
                    checked={paginatedClients.length > 0 && paginatedClients.every(c => selectedClients.has(c.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSelectAll()
                      } else {
                        handleDeselectAll()
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedClients.map((client, index) => (
                <tr key={client.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} data-testid="client-row">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <CheckboxCell
                      checked={selectedClients.has(client.id)}
                      onCheckedChange={(checked) => handleSelectClient(client.id, checked)}
                    />
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
                      </div>
                      {client.vip && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        {client.phone || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">{client.totalBookings}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">€{client.totalSpent.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatDateCompact(client.joinDate)}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client)
                          setShowViewModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View client details"
                        data-testid="view-client-btn"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client)
                          setShowEditModal(true)
                        }}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                        title="Edit client"
                        data-testid="edit-client-btn"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete client"
                        data-testid="delete-client-btn"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length} clients
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-heiwaOrange-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateClientModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            fetchClients()
          }}
        />
      )}

      {showViewModal && selectedClient && (
        <ViewClientModal
          open={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedClient(null)
          }}
          client={selectedClient}
        />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal
          open={showEditModal}
          client={selectedClient}
          onClose={() => {
            setShowEditModal(false)
            setSelectedClient(null)
          }}
          onUpdated={() => {
            setShowEditModal(false)
            setSelectedClient(null)
            fetchClients()
          }}
        />
      )}
    </div>
  )
}
