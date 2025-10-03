'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

interface NavigationItem {
  id: string
  name: string
  path: string
  order_index: number
  active: boolean
}

export default function NavigationManagement() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([])
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      fetchNavigationItems()
    }
  }, [authenticated])

  const checkAuth = () => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
    } else {
      setAuthenticated(true)
    }
    setLoading(false)
  }

  const fetchNavigationItems = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('navigation_items')
        .select('*')
        .order('order_index')

      if (error) {
        console.error('Error fetching navigation:', error)
        return
      }

      setNavigationItems(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSave = async (item: NavigationItem) => {
    try {
      const { error } = await supabaseAdmin
        .from('navigation_items')
        .upsert(item as never)

      if (error) {
        console.error('Error saving navigation item:', error)
        return
      }

      setEditingItem(null)
      fetchNavigationItems()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this navigation item?')) return

    try {
      const { error } = await supabaseAdmin
        .from('navigation_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting navigation item:', error)
        return
      }

      fetchNavigationItems()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEdit = (item: NavigationItem) => {
    setEditingItem({ ...item })
  }

  const handleCancel = () => {
    setEditingItem(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Navigation Management</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Navigation Items</h2>
                <button
                  onClick={() => setEditingItem({
                    id: '',
                    name: '',
                    path: '',
                    order_index: navigationItems.length + 1,
                    active: true
                  })}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add New Item
                </button>
              </div>

              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    {editingItem?.id === item.id ? (
                      <EditForm
                        item={editingItem}
                        onSave={handleSave}
                        onCancel={handleCancel}
                      />
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.path}</p>
                          <p className="text-xs text-gray-400">Order: {item.order_index} | Active: {item.active ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function EditForm({ item, onSave, onCancel }: {
  item: NavigationItem
  onSave: (item: NavigationItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(item)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Path</label>
          <input
            type="text"
            value={formData.path}
            onChange={(e) => setFormData({ ...formData, path: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Order</label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Active</label>
          <select
            value={formData.active ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  )
}