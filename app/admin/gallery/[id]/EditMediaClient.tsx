'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Save, Trash2, Eye, Download, Tag, Plus, X, Image as ImageIcon, Video } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  category: 'rooms' | 'surf' | 'activities' | 'facilities' | 'general'
  tags: string[]
  isActive: boolean
  uploadedAt: string
  fileSize: number
  dimensions?: { width: number; height: number }
}

interface EditMediaClientProps {
  id: string
}

export default function EditMediaClient({ id }: EditMediaClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<GalleryItem>({
    id: '',
    title: '',
    type: 'image',
    url: '',
    thumbnailUrl: '',
    category: 'general',
    tags: [],
    isActive: true,
    uploadedAt: '',
    fileSize: 0,
    dimensions: { width: 0, height: 0 }
  })
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    const fetchMediaItem = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gallery/${id}`)
        const data = await response.json()

        if (data.success && data.galleryItem) {
          setFormData({
            id: data.galleryItem.id,
            title: data.galleryItem.title,
            type: data.galleryItem.type,
            url: data.galleryItem.url,
            thumbnailUrl: data.galleryItem.thumbnail_url || '',
            category: data.galleryItem.category,
            tags: data.galleryItem.tags || [],
            isActive: data.galleryItem.is_active !== false,
            uploadedAt: data.galleryItem.uploaded_at,
            fileSize: data.galleryItem.file_size || 0,
            dimensions: data.galleryItem.dimensions || { width: 0, height: 0 }
          })
        } else {
          console.error('Failed to fetch media item:', data.error)
        }
      } catch (err) {
        console.error('Error fetching media item:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMediaItem()
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          tags: formData.tags,
          is_active: formData.isActive
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update media item')
      }

      router.push('/admin/gallery')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error updating media item:', err)
      alert(`Failed to update media item: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this media item? This action cannot be undone.')) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        router.push('/admin/gallery')
      } else {
        console.error('Failed to delete:', data.error)
        alert('Failed to delete media item. Please try again.')
      }
    } catch (err) {
      console.error('Error deleting media item:', err)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Media Item</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {formData.type === 'image' ? (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={formData.url}
                    alt={formData.title}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-400" />
                  <p className="absolute bottom-2 right-2 text-xs text-gray-500">
                    {formatFileSize(formData.fileSize)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as GalleryItem['category'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                >
                  <option value="general">General</option>
                  <option value="rooms">Rooms</option>
                  <option value="surf">Surf</option>
                  <option value="activities">Activities</option>
                  <option value="facilities">Facilities</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size
                </label>
                <p className="text-sm text-gray-600">{formatFileSize(formData.fileSize)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions
                </label>
                <p className="text-sm text-gray-600">
                  {formData.dimensions?.width && formData.dimensions?.height
                    ? `${formData.dimensions.width} × ${formData.dimensions.height}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-accent hover:text-accent-hover"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Active (visible in gallery)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
