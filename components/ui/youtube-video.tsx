'use client'

import { useState } from 'react'

interface YouTubeVideoProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: YouTubeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg ${className}`}>
      {/* YouTube iframe - never shows controls */}
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? '1' : '0'}&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="absolute inset-0"
      ></iframe>
      
      {/* Custom overlay - always visible when not playing */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
            aria-label="Play video"
          >
            <svg className="w-12 h-12 text-accent ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      )}
      
      {/* Custom controls - visible when playing */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePlayPause}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors duration-200"
              aria-label="Pause video"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
            
            <button
              onClick={handleFullscreen}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors duration-200"
              aria-label="Toggle fullscreen"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {!isFullscreen ? (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                ) : (
                  <path d="M8 3v5a2 2 0 0 1-2 2H3m18 0h-5a2 2 0 0 1-2-2V3m0 18v-5a2 2 0 0 1 2-2h5M3 16h5a2 2 0 0 1 2 2v5"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
