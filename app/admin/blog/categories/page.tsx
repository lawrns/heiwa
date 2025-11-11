'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'

interface Category {
  id: string
  slug: string
  name: string
  description?: string
  is_active: boolean
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    try {
      const url = editing ? `/api/admin/blog/categories/${editing.id}` : '/api/admin/blog/categories'
      const method = editing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug })
      })

      const data = await response.json()
      if (data.success) {
        fetchCategories()
        resetForm()
      } else {
        alert(data.error || 'Failed to save category')
      }
    } catch (err) {
      alert('Error saving category')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchCategories()
      } else {
        alert(data.error || 'Failed to delete category')
      }
    } catch (err) {
      alert('Error deleting category')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', is_active: true })
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (category: Category) => {
    setEditing(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Blog Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{editing ? 'Edit' : 'New'} Category</h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated from name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                {editing ? 'Update' : 'Create'} Category
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  {category.description && (
                    <div className="text-sm text-gray-500">{category.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
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
    </div>
  )
}

