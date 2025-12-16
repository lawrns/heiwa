'use client'

import React, { useState, useEffect } from 'react'
import { PlusCircle, Edit, Trash2, Percent, Star, Check, X } from 'lucide-react'

interface TaxCategory {
  id: string
  name: string
  rate: number
  description: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

interface EditingCategory {
  id?: string
  name: string
  rate: string
  description: string
  is_default: boolean
}

export default function TaxCategoriesPage() {
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditingCategory | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchTaxCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/tax-categories')
      const data = await response.json()

      if (data.success) {
        setTaxCategories(data.taxCategories || [])
      } else {
        setError(data.error || 'Failed to fetch tax categories')
      }
    } catch (err) {
      console.error('Error fetching tax categories:', err)
      setError('Failed to load tax categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxCategories()
  }, [])

  const handleAdd = () => {
    setEditing({
      name: '',
      rate: '',
      description: '',
      is_default: false
    })
  }

  const handleEdit = (category: TaxCategory) => {
    setEditing({
      id: category.id,
      name: category.name,
      rate: (category.rate * 100).toString(),
      description: category.description || '',
      is_default: category.is_default
    })
  }

  const handleCancel = () => {
    setEditing(null)
  }

  const handleSave = async () => {
    if (!editing) return

    if (!editing.name.trim()) {
      setError('Name is required')
      return
    }

    const rateNum = parseFloat(editing.rate)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setError('Rate must be between 0 and 100')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const url = editing.id
        ? `/api/tax-categories/${editing.id}`
        : '/api/tax-categories'
      const method = editing.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editing.name.trim(),
          rate: rateNum / 100,
          description: editing.description.trim() || null,
          is_default: editing.is_default
        })
      })

      const data = await response.json()

      if (data.success) {
        setEditing(null)
        fetchTaxCategories()
      } else {
        setError(data.error || 'Failed to save tax category')
      }
    } catch (err) {
      console.error('Error saving tax category:', err)
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax category?')) {
      return
    }

    try {
      const response = await fetch(`/api/tax-categories/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchTaxCategories()
      } else {
        setError(data.error || 'Failed to delete tax category')
      }
    } catch (err) {
      console.error('Error deleting tax category:', err)
      setError('Failed to delete. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Categories</h1>
          <p className="text-gray-600 mt-2">
            Manage VAT rates for different product and service categories
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={editing !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Tax Category</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border border-gray-200">
          <div className="flex-shrink-0 bg-orange-100 text-orange-600 rounded-full p-3">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{taxCategories.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border border-gray-200">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <Star size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Default Category</p>
            <p className="text-lg font-bold text-gray-900">
              {taxCategories.find(c => c.is_default)?.name || 'None set'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4 border border-gray-200">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <Percent size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Rate Range</p>
            <p className="text-lg font-bold text-gray-900">
              {taxCategories.length > 0
                ? `${Math.min(...taxCategories.map(c => c.rate)) * 100}% - ${Math.max(...taxCategories.map(c => c.rate)) * 100}%`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {editing && (
        <div className="bg-white shadow-md rounded-lg p-6 border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editing.id ? 'Edit Tax Category' : 'Add New Tax Category'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g., Accommodation (6%)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rate (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editing.rate}
                onChange={(e) => setEditing({ ...editing, rate: e.target.value })}
                placeholder="e.g., 6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="e.g., Reduced VAT rate for lodging services"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.is_default}
                  onChange={(e) => setEditing({ ...editing, is_default: e.target.checked })}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Set as default category for new products</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tax Categories Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Tax Categories</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {(category.rate * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {category.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.is_default ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <Star className="h-3 w-3" />
                        Default
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(category)}
                        disabled={editing !== null}
                        className="text-orange-600 hover:text-orange-700 disabled:text-gray-400"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={editing !== null}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {taxCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No tax categories found. Add your first category to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About Tax Categories</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>Tax categories define VAT rates for different types of products and services.</li>
          <li>Prices are entered tax-inclusive - the system calculates the tax portion automatically.</li>
          <li>The default category is automatically assigned to new products.</li>
          <li>You cannot delete a category that is in use by products.</li>
        </ul>
      </div>
    </div>
  )
}
