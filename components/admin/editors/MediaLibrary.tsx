"use client"

// Media Library Component
// Comprehensive media management with drag-and-drop upload

import React, { useState, useEffect, useRef } from 'react'
import { 
  AdminButton, 
  AdminInput, 
  AdminSelect, 
  AdminModal, 
  AdminAlert,
  AdminTable
} from '../ui'
import { MediaItem } from '@/lib/cms-validators'
import { supabase } from '@/lib/supabase'
import { 
  Upload, 
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react'

interface MediaLibraryProps {
  className?: string
  onSelect?: (media: MediaItem) => void
  multiSelect?: boolean
  maxSelections?: number
}

const FILE_TYPES = [
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'document', label: 'Documents' }
] as const

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'hero', label: 'Hero' },
  { value: 'activities', label: 'Activities' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'blog', label: 'Blog' }
] as const

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  className,
  onSelect,
  multiSelect = false,
  maxSelections = 10
}) => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    file_type: '',
    category: '',
    is_active: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load media
  const loadMedia = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.file_type) {
        query = query.eq('file_type', filters.file_type)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.search) {
        query = query.ilike('original_name', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setMedia(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedia()
  }, [filters])

  // Show alert
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 5000)
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Determine file type
        let fileType: MediaItem['file_type']
        if (file.type.startsWith('image/')) {
          fileType = 'image'
        } else if (file.type.startsWith('video/')) {
          fileType = 'video'
        } else {
          fileType = 'document'
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const filename = `${timestamp}_${randomString}.${fileExtension}`
        const supabasePath = `cms-media/${filename}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('cms-media')
          .upload(supabasePath, file, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cms-media')
          .getPublicUrl(supabasePath)

        // Create media item record
        const mediaItemData = {
          filename,
          original_name: file.name,
          file_type: fileType,
          file_size: file.size,
          supabase_path: supabasePath,
          public_url: publicUrl,
          alt_text: '',
          tags: [],
          category: 'general',
          is_active: true,
          order_index: 0
        }

        const { data, error } = await supabase
          .from('media_library')
          .insert([mediaItemData])
          .select()
          .single()

        if (error) throw error

        return data
      } catch (err) {
        console.error('Upload error:', err)
        throw err
      }
    })

    try {
      const results = await Promise.allSettled(uploadPromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      if (successful > 0) {
        showAlert('success', `${successful} file(s) uploaded successfully`)
      }
      if (failed > 0) {
        showAlert('error', `${failed} file(s) failed to upload`)
      }

      loadMedia()
      setIsUploadModalOpen(false)
    } catch (err) {
      showAlert('error', 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async (item: MediaItem) => {
    if (!confirm('Are you sure you want to delete this media file?')) return

    try {
      // Delete from database
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', item.id)

      if (error) throw error

      // Delete from storage
      await supabase.storage
        .from('cms-media')
        .remove([item.supabase_path])

      showAlert('success', 'Media deleted successfully')
      loadMedia()
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Failed to delete media')
    }
  }

  // Handle selection
  const handleSelect = (item: MediaItem) => {
    if (onSelect) {
      onSelect(item)
      return
    }

    if (multiSelect) {
      const isSelected = selectedMedia.some(m => m.id === item.id)
      if (isSelected) {
        setSelectedMedia(selectedMedia.filter(m => m.id !== item.id))
      } else if (selectedMedia.length < maxSelections) {
        setSelectedMedia([...selectedMedia, item])
      }
    } else {
      setSelectedMedia([item])
    }
  }

  // Table columns
  const columns: AdminTableColumn<MediaItem>[] = [
    {
      key: 'file_type',
      title: 'Type',
      render: (value: unknown) => {
        const icon = value === 'image' ? ImageIcon : value === 'video' ? Video : FileText
        return React.createElement(icon, { className: 'w-5 h-5' })
      }
    },
    {
      key: 'original_name',
      title: 'Filename'
    },
    {
      key: 'file_size',
      title: 'Size',
      render: (value: unknown) => formatFileSize(Number(value))
    },
    {
      key: 'category',
      title: 'Category'
    },
    {
      key: 'created_at',
      title: 'Uploaded',
      render: (value: unknown) => new Date(String(value)).toLocaleDateString()
    }
  ]

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <AdminButton
          variant="primary"
          icon="upload"
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Files
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <AdminInput
          placeholder="Search files..."
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
          className="flex-1 min-w-[200px]"
        />
        
        <AdminSelect
          placeholder="File type"
          options={[{ value: '', label: 'All Types' }, ...FILE_TYPES]}
          value={filters.file_type}
          onChange={(value) => setFilters({ ...filters, file_type: value as any })}
          className="min-w-[150px]"
        />
        
        <AdminSelect
          placeholder="Category"
          options={[{ value: '', label: 'All Categories' }, ...CATEGORIES]}
          value={filters.category}
          onChange={(value) => setFilters({ ...filters, category: value as any })}
          className="min-w-[150px]"
        />
      </div>

      {/* Alert */}
      {alert && (
        <div className="mb-4">
          <AdminAlert
            variant={alert.type}
            dismissible
            onDismiss={() => setAlert(null)}
          >
            {alert.message}
          </AdminAlert>
        </div>
      )}

      {/* Error */}
      {error && (
        <AdminAlert variant="error" className="mb-4">
          {error}
        </AdminAlert>
      )}

      {/* Table */}
      <AdminTable
        data={media as MediaItem[]}
        columns={columns}
        empty="No media files found. Upload your first file to get started."
        selectable={multiSelect || !!onSelect}
        selectedRows={selectedMedia as MediaItem[]}
        onSelectionChange={(rows) => setSelectedMedia(rows as MediaItem[])}
        onRowClick={(row) => handleSelect(row as MediaItem)}
      />

      {/* Upload Modal */}
      <AdminModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Files"
        size="md"
      >
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">Images, videos, and documents</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <AdminButton
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={uploading}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
            >
              Select Files
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Preview Modal */}
      <AdminModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Media Preview"
        size="lg"
      >
        {previewMedia && (
          <div className="space-y-4">
            {previewMedia.file_type === 'image' && (
              <img
                src={previewMedia.public_url}
                alt={previewMedia.alt_text}
                className="w-full h-auto rounded-lg"
              />
            )}
            
            {previewMedia.file_type === 'video' && (
              <video
                src={previewMedia.public_url}
                controls
                className="w-full h-auto rounded-lg"
              />
            )}
            
            {previewMedia.file_type === 'document' && (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">{previewMedia.original_name}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Filename:</span>
                <p className="text-gray-600">{previewMedia.original_name}</p>
              </div>
              <div>
                <span className="font-medium">Size:</span>
                <p className="text-gray-600">{formatFileSize(previewMedia.file_size || 0)}</p>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <p className="text-gray-600">{previewMedia.file_type}</p>
              </div>
              <div>
                <span className="font-medium">Category:</span>
                <p className="text-gray-600">{previewMedia.category}</p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}

export default MediaLibrary
