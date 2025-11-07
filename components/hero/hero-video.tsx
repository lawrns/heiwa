'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface HeroVideoProps {
  title: string
  description: string
  videoUrl?: string
  imageUrl?: string
  className?: string
}

export function HeroVideo({ 
  title, 
  description, 
  videoUrl, 
  imageUrl, 
  className = '' 
}: HeroVideoProps) {
  const [videoError, setVideoError] = useState(false)

  if (videoUrl && !videoError) {
    return (
      <section className={`relative h-[60vh] min-h-[400px] w-full overflow-hidden ${className}`}>
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setVideoError(true)}
          poster={imageUrl}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl?.replace('.mp4', '.webm')} type="video/webm" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto">
              {description}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Fallback to image if video fails or not provided
  return (
    <section className={`relative h-[60vh] min-h-[400px] w-full overflow-hidden ${className}`}>
      <Image
        src={imageUrl || '/images/placeholder-hero.jpg'}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
