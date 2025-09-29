'use client'

import React, { useState } from 'react'
import Image from 'next/image'

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

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden rounded-image bg-gray-100`}>
        <Image
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Dot Navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
