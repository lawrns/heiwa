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

export default function EditMediaPage({ params }: { params: { id: string } }) {
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
    // TODO: Fetch media item from API
    // For now, simulate loading with mock data
    setTimeout(() => {
      setFormData({
        id: params.id,
        title: 'Dorm Room Interior',
        type: 'image',
        url: '/images/rooms/dorm-room-1.jpg',
        thumbnailUrl: '/images/rooms/dorm-room-1-thumb.jpg',
        category: 'rooms',
        tags: ['dorm', 'interior', 'bunk-beds'],
        isActive: true,
        uploadedAt: '2024-01-15T10:30:00Z',
        fileSize: 2048576,
        dimensions: { width: 1920, height: 1080 }
      })
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual API call to update media item
    console.log('Updating media item:', formData)
    router.push('/admin/gallery')
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this media item? This action cannot be undone.')) return
    
    // TODO: Implement actual API call to delete media item
    console.log('Deleting media item:', params.id)
    router.push('/admin/gallery')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rooms':
        return <ImageIcon size={20} className="text-blue-500" />
      case 'surf':
        return <Video size={20} className="text-green-500" />
      case 'activities':
        return <ImageIcon size={20} className="text-purple-500" />
      case 'facilities':
        return <ImageIcon size={20} className="text-orange-500" />
      case 'general':
        return <ImageIcon size={20} className="text-gray-500" />
      default:
        return <ImageIcon size={20} className="text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Media</h1>
        </div>
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Media</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-6 space-y-6">
          {/* Media Preview */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media Preview</h2>
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-64 h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {formData.type === 'image' ? (
                    <Image
                      src={formData.thumbnailUrl || formData.url}
                      alt={formData.title}
                      width={256}
                      height={192}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video size={64} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{formData.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{formData.type === 'image' ? 'Image' : 'Video'}</span>
                    <span>{formatFileSize(formData.fileSize)}</span>
                    {formData.dimensions && (
                      <span>{formData.dimensions.width} × {formData.dimensions.height}</span>
                    )}
                    <span>Uploaded {formatDate(formData.uploadedAt)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.open(formData.url, '_blank')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Original
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = formData.url
                      a.download = formData.title
                      a.click()
                    }}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent appearance-none"
                    required
                  >
                    <option value="rooms">Rooms</option>
                    <option value="surf">Surf</option>
                    <option value="activities">Activities</option>
                    <option value="facilities">Facilities</option>
                    <option value="general">General</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getCategoryIcon(formData.category)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    <Tag size={12} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add new tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="block text-sm text-gray-900">
                  Active (available for use on website)
                </label>
              </div>
            </div>
          </div>

          {/* Usage Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">File URL:</span>
                <div className="mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono break-all">
                  {formData.url}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Thumbnail URL:</span>
                <div className="mt-1 p-2 bg-white border border-gray-200 rounded text-xs font-mono break-all">
                  {formData.thumbnailUrl || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

