'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, HelpCircle, Search, Filter, GripVertical, Eye, EyeOff, Download } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminModal from '@/components/admin/ui/AdminModal'
import AdminAlert from '@/components/admin/ui/AdminAlert'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  page_slug: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { value: 'general', label: 'General', color: 'blue' },
  { value: 'booking', label: 'Booking', color: 'green' },
  { value: 'surfing', label: 'Surfing', color: 'purple' },
  { value: 'accommodation', label: 'Accommodation', color: 'orange' },
  { value: 'activities', label: 'Activities', color: 'pink' },
  { value: 'policies', label: 'Policies', color: 'red' },
  { value: 'location', label: 'Location', color: 'yellow' }
]

const PAGE_SLUGS = [
  { value: 'general', label: 'General' },
  { value: 'flow', label: 'Flow' },
  { value: 'play', label: 'Play' },
  { value: 'surf', label: 'Surf' },
  { value: 'the-spot', label: 'The Spot' }
]

export function FAQManager() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFAQItems()
  }, [filter])

  const fetchFAQItems = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const url = filter === 'all' 
        ? '/api/admin/faq'
        : `/api/admin/faq?category=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setFaqItems(data.data)
      } else {
        setError(data.error || 'Failed to fetch FAQ items')
      }
    } catch (err) {
      setError('Error loading FAQ items')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFAQ = () => {
    setEditingFAQ(null)
    setShowModal(true)
  }

  const handleEditFAQ = (faq: FAQItem) => {
    setEditingFAQ(faq)
    setShowModal(true)
  }

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return
    
    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess('FAQ item deleted successfully')
        fetchFAQItems()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to delete FAQ item')
      }
    } catch (err) {
      setError('Error deleting FAQ item')
    }
  }

  const handleToggleActive = async (faq: FAQItem) => {
    try {
      const response = await fetch(`/api/admin/faq/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...faq,
          is_active: !faq.is_active,
          updated_by: 'admin'
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`FAQ item ${faq.is_active ? 'deactivated' : 'activated'} successfully`)
        fetchFAQItems()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update FAQ item')
      }
    } catch (err) {
      setError('Error updating FAQ item')
    }
  }

  const exportToCSV = () => {
    const headers = ['Question', 'Answer', 'Category', 'Page', 'Order', 'Active', 'Date']
    const rows = faqItems.map(f => [
      `"${f.question.replace(/"/g, '""')}"`,
      `"${f.answer.replace(/"/g, '""')}"`,
      f.category,
      f.page_slug,
      f.order_index,
      f.is_active ? 'Yes' : 'No',
      new Date(f.created_at).toLocaleDateString()
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faq-items-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat ? cat.color : 'gray'
  }

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FAQ Manager</h2>
          <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <div className="flex space-x-3">
          <AdminButton onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </AdminButton>
          <AdminButton onClick={handleCreateFAQ}>
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </AdminButton>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions and answers..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <AdminAlert variant="success">
          {success}
        </AdminAlert>
      )}
      
      {error && (
        <AdminAlert variant="error">
          {error}
        </AdminAlert>
      )}

      {/* FAQ Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching FAQs' : 'No FAQ items'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Start building your FAQ section.'}
            </p>
            {!searchTerm && (
              <AdminButton onClick={handleCreateFAQ} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First FAQ
              </AdminButton>
            )}
          </div>
        ) : (
          filteredItems.map((faq, index) => (
            <div
              key={faq.id}
              className={`bg-white rounded-lg shadow p-6 border-2 transition-all ${
                faq.is_active ? 'border-gray-200' : 'border-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {faq.question}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getCategoryColor(faq.category)}-100 text-${getCategoryColor(faq.category)}-800`}>
                        {getCategoryLabel(faq.category)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {faq.page_slug || 'general'}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {faq.answer}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>Order: {faq.order_index}</span>
                      <span>Created: {new Date(faq.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(faq)}
                    className={`p-2 rounded-lg transition-colors ${
                      faq.is_active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={faq.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {faq.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleEditFAQ(faq)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit FAQ"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteFAQ(faq.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete FAQ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAQ Editor Modal */}
      {showModal && (
        <FAQEditorModal
          faq={editingFAQ}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false)
            fetchFAQItems()
            setSuccess('FAQ item saved successfully')
            setTimeout(() => setSuccess(null), 3000)
          }}
        />
      )}
    </div>
  )
}

// FAQ Editor Modal Component
interface FAQEditorModalProps {
  faq: FAQItem | null
  onClose: () => void
  onSave: () => void
}

function FAQEditorModal({ faq, onClose, onSave }: FAQEditorModalProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    page_slug: 'general',
    order_index: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        page_slug: faq.page_slug || 'general',
        order_index: faq.order_index,
        is_active: faq.is_active
      })
    }
  }, [faq])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = faq 
        ? `/api/admin/faq/${faq.id}`
        : '/api/admin/faq'
      
      const method = faq ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          created_by: 'admin',
          updated_by: 'admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        onSave()
      } else {
        setError(data.error || 'Failed to save FAQ item')
      }
    } catch (err) {
      setError('Error saving FAQ item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal isOpen={true} onClose={onClose} title={faq ? 'Edit FAQ' : 'Add FAQ'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <AdminAlert variant="error">
            {error}
          </AdminAlert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question *
          </label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What is your question?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer *
          </label>
          <textarea
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Provide a detailed answer..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page
            </label>
            <select
              value={formData.page_slug}
              onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PAGE_SLUGS.map(slug => (
                <option key={slug.value} value={slug.value}>
                  {slug.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Index
          </label>
          <input
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            FAQ item is active
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <AdminButton type="button" variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={loading}>
            {loading ? 'Saving...' : (faq ? 'Update' : 'Create')} FAQ
          </AdminButton>
        </div>
      </form>
    </AdminModal>
  )
}

export default FAQManager
