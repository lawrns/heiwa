'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Upload, Search, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  filename: string
  original_name: string
  file_type: string
  public_url: string
  alt_text?: string
  category?: string
}

interface MediaLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentImage?: string
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentImage,
}: MediaLibraryModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load media when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMedia()
      setSelectedUrl(currentImage || null)
    }
  }, [isOpen, currentImage])

  const loadMedia = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        file_type: 'image',
        sort_by: 'created_at',
        sort_order: 'desc',
        limit: '100',
      })

      const response = await fetch(`/api/cms/media?${params.toString()}`)
      const result = await response.json()

      if (response.ok) {
        setMedia(result?.data || [])
      }
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    try {
      const file = files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        alert('File size must be less than 50MB')
        return
      }

      const form = new FormData()
      form.set('file', file)
      form.set('alt_text', '')
      form.set('category', 'general')
      form.set('tags', '')

      const response = await fetch('/api/cms/media', {
        method: 'POST',
        credentials: 'include',
        body: form,
      })

      const result = await response.json()
      
      if (!response.ok) {
        const errorMessage = result?.message || result?.error || `Upload failed (${response.status})`
        alert(errorMessage)
        console.error('Upload failed:', result)
        return
      }

      if (result?.data?.public_url) {
        // Auto-select the newly uploaded image
        setSelectedUrl(result.data.public_url)
        loadMedia()
      } else {
        console.error('Unexpected response format:', result)
        alert('Upload succeeded but received unexpected response format')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedUrl) {
      onSelect(selectedUrl)
    }
  }

  const filteredMedia = media.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.original_name?.toLowerCase().includes(query) ||
      item.alt_text?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Select Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 px-6 py-3 border-b bg-gray-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'No images match your search' : 'No images uploaded yet'}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedUrl(item.public_url)}
                  className={cn(
                    'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                    selectedUrl === item.public_url
                      ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-2'
                      : 'border-transparent hover:border-gray-300'
                  )}
                >
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.original_name}
                    className="w-full h-full object-cover"
                  />
                  {selectedUrl === item.public_url && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  )
}
