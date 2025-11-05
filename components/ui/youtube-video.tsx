'use client'

import { useState } from 'react'

interface YouTubeVideoProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: YouTubeVideoProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  
  const handleVideoClick = () => {
    setIsVideoPlaying(true)
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg group cursor-pointer ${className}`} onClick={handleVideoClick}>
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?${isVideoPlaying ? 'autoplay=1&mute=0' : 'autoplay=1&mute=1&playsinline=1'}&controls=0&showinfo=0&rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0"
      ></iframe>
      
      {/* Overlay - only show when video hasn't been clicked */}
      {!isVideoPlaying && (
        <>
          {/* Click Me Overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <span className="font-semibold text-gray-900">Click to Play</span>
              </div>
            </div>
          </div>
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-lg transform scale-100 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
