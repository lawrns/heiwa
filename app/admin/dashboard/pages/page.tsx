'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface PageContent {
  [key: string]: unknown
}

interface Page {
  id: string
  slug: string
  title: string
  content: PageContent
  published: boolean
  created_at: string
  updated_at: string
}

export default function PagesManagement() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState<Page[]>([])
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '{}',
    published: true
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
    } else {
      setAuthenticated(true)
      fetchPages()
    }
    setLoading(false)
  }, [router])

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pages:', error)
        return
      }

      setPages(data || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Parse JSON content
      let parsedContent
      try {
        parsedContent = JSON.parse(formData.content)
      } catch {
        alert('Invalid JSON content. Please check your syntax.')
        return
      }

      if (editingPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update({
            slug: formData.slug,
            title: formData.title,
            content: parsedContent,
            published: formData.published,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPage.id)

        if (error) throw error
      } else {
        // Create new page
        const { error } = await supabase
          .from('pages')
          .insert([{
            slug: formData.slug,
            title: formData.title,
            content: parsedContent,
            published: formData.published
          }])

        if (error) throw error
      }

      // Reset form and close modal
      setFormData({ slug: '', title: '', content: '{}', published: true })
      setEditingPage(null)
      setIsModalOpen(false)
      fetchPages()
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page. Please try again.')
    }
  }

  const handleEdit = (page: Page) => {
    setEditingPage(page)
    setFormData({
      slug: page.slug,
      title: page.title,
      content: JSON.stringify(page.content, null, 2),
      published: page.published
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Error deleting page. Please try again.')
    }
  }

  const openCreateModal = () => {
    setEditingPage(null)
    setFormData({ slug: '', title: '', content: '{}', published: true })
    setIsModalOpen(true)
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
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Manage Pages</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Page
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {pages.map((page) => (
                <li key={page.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Slug: /{page.slug}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {page.published ? 'Published' : 'Draft'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Updated: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPage ? 'Edit Page' : 'Add New Page'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="home, about, contact"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content (JSON)</label>
                  <textarea
                    required
                    rows={15}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                    placeholder='{"hero": {"title": "Welcome", "subtitle": "Subtitle"}}'
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Published</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    {editingPage ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
