'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import AdminButton from '@/components/admin/ui/AdminButton'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  accept?: string
  maxSize?: number // in MB
}

export default function ImageUpload({
  value,
  onChange,
  placeholder = 'Upload an image or enter URL',
  accept = 'image/*',
  maxSize = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }

    try {
      setUploading(true)

      // For now, we'll create a local URL
      // In production, you would upload to Supabase Storage or CDN
      const url = URL.createObjectURL(file)
      onChange(url)
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleRemove = () => {
    onChange('')
    setError(null)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!value && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-[border-color,background-color] duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">
              {uploading ? 'Uploading...' : placeholder}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop an image here, or click to browse
            </p>
            <AdminButton
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </AdminButton>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or enter image URL
        </label>
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-[border-color,box-shadow] duration-200"
        />
      </div>

      {/* Preview */}
      {value && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Preview
            </label>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </AdminButton>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.jpg'
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* File Info */}
      {value && !value.startsWith('blob:') && (
        <div className="text-xs text-gray-500">
          Image URL: {value}
        </div>
      )}
    </div>
  )
}
