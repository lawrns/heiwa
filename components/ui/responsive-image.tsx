'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  blurDataURL?: string
}

/**
 * Responsive image component with automatic optimization
 * Uses Next.js Image component with responsive srcset generation
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  blurDataURL
}: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      className={cn('object-cover', className)}
    />
  )
}

/**
 * Responsive image with multiple breakpoints
 */
export interface ResponsiveImageBreakpointsProps {
  src: string
  alt: string
  breakpoints?: {
    mobile?: { width: number; height: number }
    tablet?: { width: number; height: number }
    desktop?: { width: number; height: number }
  }
  className?: string
  priority?: boolean
  quality?: number
}

export function ResponsiveImageBreakpoints({
  src,
  alt,
  breakpoints = {},
  className,
  priority = false,
  quality = 85
}: ResponsiveImageBreakpointsProps) {
  const {
    mobile = { width: 640, height: 360 },
    tablet = { width: 1024, height: 576 },
    desktop = { width: 1920, height: 1080 }
  } = breakpoints

  return (
    <picture className={className}>
      {/* Desktop */}
      <source
        media="(min-width: 1200px)"
        srcSet={`${src}?w=${desktop.width}&h=${desktop.height}&q=${quality}&f=webp`}
        type="image/webp"
      />
      <source
        media="(min-width: 1200px)"
        srcSet={`${src}?w=${desktop.width}&h=${desktop.height}&q=${quality}`}
      />

      {/* Tablet */}
      <source
        media="(min-width: 768px)"
        srcSet={`${src}?w=${tablet.width}&h=${tablet.height}&q=${quality}&f=webp`}
        type="image/webp"
      />
      <source
        media="(min-width: 768px)"
        srcSet={`${src}?w=${tablet.width}&h=${tablet.height}&q=${quality}`}
      />

      {/* Mobile */}
      <source
        srcSet={`${src}?w=${mobile.width}&h=${mobile.height}&q=${quality}&f=webp`}
        type="image/webp"
      />
      <source
        srcSet={`${src}?w=${mobile.width}&h=${mobile.height}&q=${quality}`}
      />

      {/* Fallback */}
      <img
        src={src}
        alt={alt}
        width={mobile.width}
        height={mobile.height}
        loading={priority ? 'eager' : 'lazy'}
        className="w-full h-full object-cover"
      />
    </picture>
  )
}

/**
 * Hero image component with full-screen support
 */
export interface HeroImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  overlay?: boolean
}

export function HeroImage({ src, alt, className, priority = true, overlay = false }: HeroImageProps) {
  return (
    <div className={cn('relative w-full h-full', className)}>
      <ResponsiveImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="100vw"
        quality={90}
        className="w-full h-full"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      )}
    </div>
  )
}

/**
 * Carousel image component with optimized loading
 */
export interface CarouselImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
}

export function CarouselImage({ src, alt, className, loading = 'lazy' }: CarouselImageProps) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      fill
      priority={loading === 'eager'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
      quality={85}
      className={className}
    />
  )
}
