/**
 * Image Blur Placeholder Component
 * Airbnb-quality image loading with blur-up effect
 * 
 * Requirements: 9.1, 9.2, 9.5
 * - Blur placeholder during load
 * - Smooth fade-in on load complete
 * - Fallback on error
 */

'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface ImageBlurProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  /** Fallback image URL if main image fails to load */
  fallbackSrc?: string
  /** Whether to show a skeleton while loading */
  showSkeleton?: boolean
  /** Custom blur placeholder color */
  placeholderColor?: string
  /** Callback when image loads successfully */
  onLoadComplete?: () => void
  /** Callback when image fails to load */
  onLoadError?: () => void
  /** Container className */
  containerClassName?: string
}

/**
 * ImageBlur component with progressive loading
 * Shows blur placeholder, then fades in the full image
 */
export function ImageBlur({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  showSkeleton = true,
  placeholderColor = '#f3f4f6',
  onLoadComplete,
  onLoadError,
  className,
  containerClassName,
  ...props
}: ImageBlurProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [currentSrc, setCurrentSrc] = React.useState(src)

  // Reset state when src changes
  React.useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setCurrentSrc(src)
  }, [src])

  const handleLoad = () => {
    setIsLoading(false)
    onLoadComplete?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    // Try fallback if available and not already using it
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
      setHasError(false)
    } else {
      onLoadError?.()
    }
  }

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Skeleton/Shimmer while loading */}
      {showSkeleton && isLoading && (
        <div 
          className="absolute inset-0 shimmer"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-all duration-standard ease-out',
          // Blur and scale while loading
          isLoading && 'scale-105 blur-lg',
          // Clear and normal when loaded
          !isLoading && 'scale-100 blur-0',
          // Fade in
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Error state */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * ImageBlurBackground - For background images with blur effect
 */
export function ImageBlurBackground({
  src,
  alt,
  fallbackSrc,
  className,
  children,
  ...props
}: ImageBlurProps & { children?: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentSrc, setCurrentSrc] = React.useState(src)

  React.useEffect(() => {
    setIsLoading(true)
    setCurrentSrc(src)
  }, [src])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-all duration-slow ease-out',
          isLoading && 'scale-110 blur-xl opacity-50',
          !isLoading && 'scale-100 blur-0 opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setCurrentSrc(fallbackSrc)
          }
        }}
        {...props}
      />
      
      {/* Content overlay */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * ImageGalleryItem - Optimized for gallery/carousel use
 */
export function ImageGalleryItem({
  src,
  alt,
  aspectRatio = '4/3',
  className,
  ...props
}: ImageBlurProps & { aspectRatio?: string }) {
  return (
    <div 
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={{ aspectRatio }}
    >
      <ImageBlur
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    </div>
  )
}

export default ImageBlur
