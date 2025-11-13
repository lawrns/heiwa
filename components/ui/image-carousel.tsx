'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  showDots?: boolean
  showArrows?: boolean
  aspectRatio?: string
  autoAdvance?: boolean
  autoAdvanceInterval?: number
}

export function ImageCarousel({
  images,
  alt,
  className = '',
  showDots = true,
  showArrows = true,
  aspectRatio = 'aspect-video',
  autoAdvance = true,
  autoAdvanceInterval = 5000
}: ImageCarouselProps) {
  // Filter out empty or invalid image URLs
  const validImages = images.filter(img => img && img.trim() !== '')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
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

  // Auto-advance carousel every N seconds when not hovered and not paused
  useEffect(() => {
    if (autoAdvance && validImages.length > 1 && !isHovered && !isPaused) {
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
  }, [autoAdvance, validImages.length, isHovered, isPaused, autoAdvanceInterval])

  // Reset currentIndex if it's out of bounds
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0)
    }
  }, [validImages.length, currentIndex])

  if (validImages.length === 0) {
    // Return placeholder if no valid images
    return (
      <div className={`relative ${aspectRatio} overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">No image available</span>
      </div>
    )
  }

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <div className={`relative ${aspectRatio} overflow-hidden rounded-lg`}>
        <Image
          src={validImages[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={currentIndex === 0}
          unoptimized={validImages[currentIndex]?.includes('supabase.co')}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            // Try fallback image
            if (target.src !== '/images/rooms/room1.jpg') {
              target.src = '/images/rooms/room1.jpg'
            }
          }}
        />
        
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
        
        {/* Pause/Play Button */}
        {autoAdvance && validImages.length > 1 && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
          {currentIndex + 1}/{validImages.length}
        </div>
      )}

      {/* Dots Indicator */}
      {showDots && validImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2 ${
                index === currentIndex
                  ? 'bg-gray-800'
                  : 'bg-gray-300 hover:bg-gray-500'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
