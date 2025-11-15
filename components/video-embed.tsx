'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
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

  const getEmbedUrl = useMemo(() => {
    if (provider === 'youtube') {
      const videoId = src.split('/').pop()?.split('?')[0]
      // No controls format with all parameters to prevent hydration mismatch
      return `https://www.youtube.com/embed/${videoId}?si=WWXSAJs0SAnR0wHY&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`
    } else if (provider === 'vimeo') {
      const videoId = src.split('/').pop()?.split('?')[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    return src
  }, [provider, src])

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
          width="560"
          height="315"
          src={getEmbedUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; compute-pressure"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
          className="w-full h-full"
        />
      )}
    </div>
  )
}
