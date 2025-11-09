'use client'

import { useState } from 'react'

interface YouTubeVideoProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: YouTubeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}>
      {!isPlaying ? (
        // Thumbnail with play button
        <div className="relative w-full h-full">
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to lower quality if maxresdefault fails
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-300"
              aria-label="Play video"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Simple iframe - minimal YouTube parameters to avoid blocking
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0"
        />
      )}
    </div>
  )
}
