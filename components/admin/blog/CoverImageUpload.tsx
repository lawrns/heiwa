'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface CoverImageUploadProps {
  value?: string
  onChange: (url: string) => void
  altText?: string
  onAltTextChange?: (alt: string) => void
}

export function CoverImageUpload({ value, onChange, altText, onAltTextChange }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('File must be an image')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', 'blog-images')
    formData.append('path', 'covers')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onChange(data.data.url)
        if (!altText && onAltTextChange) {
          onAltTextChange(file.name.replace(/\.[^/.]+$/, ''))
        }
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      alert('Error uploading image')
      console.error(error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative group">
          <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={value}
              alt={altText || 'Cover image'}
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            className="hidden"
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Click to upload cover image</p>
          <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
        </div>
      )}
      
      {value && onAltTextChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alt Text
          </label>
          <input
            type="text"
            value={altText || ''}
            onChange={(e) => onAltTextChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Describe the image for accessibility"
          />
        </div>
      )}
    </div>
  )
}

