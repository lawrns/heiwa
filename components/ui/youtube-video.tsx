'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: VideoPlayerProps) {
  const [currentImage, setCurrentImage] = useState(0)
  
  // Use local images instead of video to avoid blocking
  const images = [
    '/optimized/photography_010_dsc03491.webp',
    '/optimized/photography_011_dsc03521-scaled.webp',
    '/optimized/photography_012_dsc03530-scaled.webp',
    '/optimized/photography_001_dji_0098-scaled.webp',
    '/optimized/photography_004_dsc02099-scaled.webp'
  ]
  
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }
  
  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}>
      <img
        src={images[currentImage]}
        alt={title}
        className="w-full h-full object-cover"
      />
      
      {/* Navigation controls */}
      <button
        onClick={prevImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Image indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImage ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Title overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
    </div>
  )
}
