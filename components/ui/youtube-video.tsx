'use client'

import { useState, useRef } from 'react'

interface VideoPlayerProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeVideo({ videoId, title, className = '' }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Map YouTube video IDs to local video files
  const videoMap: { [key: string]: string } = {
    '9nhQiKGsgHg': '/images/videos/Timeline-1.mp4',
    // Add more mappings as needed
  }

  const localVideoSrc = videoMap[videoId] || '/images/videos/Timeline-1.mp4'
  
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900 ${className}`}>
      {!isPlaying ? (
        // Thumbnail with play button
        <div className="relative w-full h-full">
          <img
            src="/optimized/photography_010_dsc03491.webp"
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-xl hover:scale-110 transition-all duration-300"
              aria-label="Play video"
            >
              <svg className="w-12 h-12 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        // Self-hosted video player - NO YouTube, NO tracking
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          controls
          playsInline
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={localVideoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  )
}
