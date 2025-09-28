'use client'

import { useState, useRef, useEffect } from 'react'
import { Play } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { VideoEmbedProps } from '@/lib/types'

export function VideoEmbed({
  src,
  provider = 'youtube',
  poster,
  className,
  title = 'Video'
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlayClick = () => {
    setIsLoaded(true)
  }

  const getEmbedUrl = () => {
    if (provider === 'youtube') {
      const videoId = src.split('/').pop()?.split('?')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    } else if (provider === 'vimeo') {
      const videoId = src.split('/').pop()?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    return src
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full aspect-video bg-surface rounded-lg overflow-hidden', className)}
      role="region"
      aria-label={`${provider} video: ${title}`}
    >
      {!isLoaded ? (
        // Poster with play button
        <div className="relative w-full h-full cursor-pointer group" style={{ position: 'relative' }} onClick={handlePlayClick}>
          {poster && isInView && (
            <Image
              src={poster}
              alt={`${title} poster`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/90 hover:bg-primary rounded-full p-4 transition-all duration-200 group-hover:scale-110">
              <Play className="w-8 h-8 text-on-primary fill-current" />
            </div>
          </div>

          {/* Loading text */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-text text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Click to play video
            </p>
          </div>
        </div>
      ) : (
        // Embedded video player
        <iframe
          src={getEmbedUrl()}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  )
}
