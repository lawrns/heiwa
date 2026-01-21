'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CarouselImage as CarouselImageType } from '@/types/image'
import { CarouselImage } from './responsive-image'

interface ImageCarouselProps {
  images: string[] | CarouselImageType[]
  alt?: string
  className?: string
  showDots?: boolean
  showArrows?: boolean
  aspectRatio?: string
  autoAdvance?: boolean
  autoAdvanceInterval?: number
}

export function ImageCarousel({
  images,
  alt = 'Gallery image',
  className = '',
  showDots = true,
  showArrows = true,
  aspectRatio = 'aspect-video',
  autoAdvance = true,
  autoAdvanceInterval = 5000
}: ImageCarouselProps) {
  // Convert string[] to CarouselImage[] if needed
  const carouselImages: CarouselImageType[] = (() => {
    if (images.length === 0) return []
    
    // If already CarouselImage[], return as-is
    if (typeof images[0] === 'object') {
      return images as CarouselImageType[]
    }
    
    // Convert string[] to CarouselImage[]
    return (images as string[]).map((url, index) => ({
      id: crypto.randomUUID(),
      url,
      alt_text: alt,
      order: index,
      created_at: new Date().toISOString()
    }))
  })()

  // Filter out images without URLs
  const validImages = carouselImages.filter(img => img.url && img.url.trim() !== '')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? validImages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    if (index >= 0 && index < validImages.length) {
      setCurrentIndex(index)
    }
  }

  // Auto-advance carousel every N seconds when not hovered
  useEffect(() => {
    if (autoAdvance && validImages.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === validImages.length - 1 ? 0 : prevIndex + 1
        )
      }, autoAdvanceInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoAdvance, validImages.length, isHovered, autoAdvanceInterval])

  // Reset currentIndex if it's out of bounds
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0)
    }
  }, [validImages.length, currentIndex])

  if (validImages.length === 0) {
    return (
      <div className={`relative ${aspectRatio} overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  const currentImage = validImages[currentIndex]

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <div className={`relative ${aspectRatio} overflow-hidden rounded-lg`}>
        <CarouselImage
          src={currentImage.url}
          alt={currentImage.alt_text || alt}
          loading={currentIndex === 0 ? 'eager' : 'lazy'}
          className="w-full h-full"
        />

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm">{currentImage.caption}</p>
          </div>
        )}

        {/* Navigation Arrows */}
        {showArrows && validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
            {currentIndex + 1}/{validImages.length}
          </div>
        )}

        {/* Dots Indicator */}
        {showDots && validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
