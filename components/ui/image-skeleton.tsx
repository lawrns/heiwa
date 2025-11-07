'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { motion } from 'framer-motion'

interface ImageSkeletonProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  skeletonClassName?: string
}

export function ImageSkeleton({
  src,
  alt,
  skeletonClassName = 'bg-gray-200',
  className,
  ...props
}: ImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton Loader */}
      {isLoading && (
        <motion.div
          className={`absolute inset-0 ${skeletonClassName}`}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ zIndex: 10 }}
        />
      )}

      {/* Image */}
      <Image
        src={hasError ? '/images/placeholder.jpg' : src}
        alt={alt}
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        {...props}
      />
    </div>
  )
}
