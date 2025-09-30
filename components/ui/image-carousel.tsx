'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  aspectRatio?: 'video' | 'square' | 'portrait'
}

export function ImageCarousel({ 
  images, 
  alt, 
  className = '',
  aspectRatio = 'video' 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  }

  if (!images || images.length === 0) {
    return (
      <div className={`${aspectClasses[aspectRatio]} bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-400">No images available</p>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden bg-gray-100`}>
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={currentIndex === 0}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dot Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white rounded-full'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75 rounded-full'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}