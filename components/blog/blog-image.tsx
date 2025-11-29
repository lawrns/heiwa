'use client'

import Image from 'next/image'
import { useState } from 'react'

interface BlogImageProps {
  src: string
  alt: string
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
}

const FALLBACK_IMAGE = '/images/surf-weeks.jpg'

// Known broken Unsplash images that need replacement
const BROKEN_IMAGES: Record<string, string> = {
  'photo-1551524164-6cf77f5e7f8e': '/images/surf4.jpg', // Surf gear essentials
}

function getValidImageUrl(src: string): string {
  // Check if it's a known broken Unsplash image
  for (const [brokenId, replacement] of Object.entries(BROKEN_IMAGES)) {
    if (src.includes(brokenId)) {
      return replacement
    }
  }
  return src
}

export function BlogImage({ src, alt, fill = true, sizes, className, priority }: BlogImageProps) {
  const [imgSrc, setImgSrc] = useState(() => getValidImageUrl(src))
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(FALLBACK_IMAGE)
    }
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={handleError}
      unoptimized={imgSrc.includes('unsplash.com')}
    />
  )
}
