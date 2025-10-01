'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Experience {
  id: string
  title: string
  image_url: string | null
  category: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export default function ExperiencesManagement() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: '',
    active: true
  })
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/admin')
    } else {
      setAuthenticated(true)
      fetchExperiences()
    }
    setLoading(false)
  }, [router])

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching experiences:', error)
        return
      }

      setExperiences(data || [])
    } catch (error) {
      console.error('Error fetching experiences:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingExperience) {
        // Update existing experience
        const updateData: Partial<Experience> = {
          title: formData.title,
          image_url: formData.image_url || null,
          category: formData.category || null,
          active: formData.active,
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('experiences')
          .update(updateData)
          .eq('id', editingExperience.id)

        if (error) throw error
      } else {
        // Create new experience
        const { error } = await supabase
          .from('experiences')
          .insert([{
            title: formData.title,
            image_url: formData.image_url || null,
            category: formData.category || null,
            active: formData.active
          }])

        if (error) throw error
      }

      // Reset form and close modal
      setFormData({ title: '', image_url: '', category: '', active: true })
      setEditingExperience(null)
      setIsModalOpen(false)
      fetchExperiences()
    } catch (error) {
      console.error('Error saving experience:', error)
      alert('Error saving experience. Please try again.')
    }
  }

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience)
    setFormData({
      title: experience.title,
      image_url: experience.image_url || '',
      category: experience.category || '',
      active: experience.active
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchExperiences()
    } catch (error) {
      console.error('Error deleting experience:', error)
      alert('Error deleting experience. Please try again.')
    }
  }

  const openCreateModal = () => {
    setEditingExperience(null)
    setFormData({ title: '', image_url: '', category: '', active: true })
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
              <h1 className="text-2xl font-bold text-gray-900">Manage Experiences</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Experience
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {experiences.map((experience) => (
                <li key={experience.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      {experience.image_url && (
                        <img
                          src={experience.image_url}
                          alt={experience.title}
                          className="h-16 w-16 object-cover rounded-md mr-4"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {experience.title}
                        </h3>
                        {experience.category && (
                          <p className="text-sm text-gray-500">
                            Category: {experience.category}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          Status: {experience.active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(experience)}
                        className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(experience.id)}
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingExperience ? 'Edit Experience' : 'Add New Experience'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
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
                    {editingExperience ? 'Update' : 'Create'}
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
