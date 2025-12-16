'use client'

import { useState } from 'react'
import { Image, X } from 'lucide-react'
import { MediaLibraryModal } from './MediaLibraryModal'
import { cn } from '@/lib/utils'

interface ImagePickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  className?: string
}

/**
 * ImagePicker - A button that opens MediaLibraryModal for image selection
 * Shows a thumbnail preview when an image is selected
 */
export function ImagePicker({
  value,
  onChange,
  label,
  placeholder = 'Select image...',
  className,
}: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (url: string) => {
    onChange(url)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'w-full flex items-center gap-3 p-2 border border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50/50 transition-colors text-left',
          value && 'pr-2'
        )}
      >
        {/* Thumbnail or placeholder */}
        {value ? (
          <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Image className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Text */}
        <span className={cn('flex-1 text-sm truncate', value ? 'text-gray-900' : 'text-gray-500')}>
          {value ? value.split('/').pop() : placeholder}
        </span>

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Clear image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      <MediaLibraryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        currentImage={value}
      />
    </div>
  )
}
