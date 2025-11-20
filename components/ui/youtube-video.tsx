'use client'

import { useState, useEffect } from 'react'

interface VideoPlayerProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('')

  // Extract video ID from URL if full URL is provided
  const extractVideoId = (idOrUrl: string): string => {
    if (idOrUrl.includes('youtu.be/')) {
      return idOrUrl.split('youtu.be/')[1]?.split('?')[0] || idOrUrl
    }
    if (idOrUrl.includes('youtube.com/watch?v=')) {
      return idOrUrl.split('v=')[1]?.split('&')[0] || idOrUrl
    }
    return idOrUrl
  }

  // Only set URL on client side to prevent hydration mismatch
  useEffect(() => {
    const cleanVideoId = extractVideoId(videoId)
    setEmbedUrl(`https://www.youtube.com/embed/${cleanVideoId}?si=WWXSAJs0SAnR0wHY&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`)
  }, [videoId])

  // Always render the same structure to prevent hydration mismatch
  // The src will be empty on server, then set on client after mount
  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`} suppressHydrationWarning>
      {/* Loading overlay - always rendered, visibility controlled by CSS */}
      <div 
        className={`absolute inset-0 flex items-center justify-center z-10 bg-gray-900 transition-opacity duration-300 ${
          embedUrl ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        suppressHydrationWarning
      >
        <div className="text-white">Loading video...</div>
      </div>
      
      {/* Always render iframe with same structure to prevent hydration mismatch */}
      {/* Use empty string instead of undefined to ensure consistent rendering */}
      <iframe
        width="560"
        height="315"
        src={embedUrl || ''} // Empty string on server, set on client
        title={title || "YouTube video player"}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        suppressHydrationWarning // Suppress warning for src attribute that changes after hydration
      />
    </div>
  )
}
