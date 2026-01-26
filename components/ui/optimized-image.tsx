'use client'

import Image, { ImageProps } from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string
  threshold?: number
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  threshold = 100,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: threshold / 100 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, priority])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
  }

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : '16/9' }}
      />
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
