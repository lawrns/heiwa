'use client'

import { ImageCarousel } from '@/components/ui/image-carousel'

interface ActivityHighlightProps {
  title: string
  description: string
  videoUrl: string
  videoPoster?: string
  carouselImages: string[]
  reversed?: boolean
}

export function ActivityHighlight({
  title,
  description,
  videoUrl,
  videoPoster,
  carouselImages,
  reversed = false
}: ActivityHighlightProps) {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 break-words hyphens-auto">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className={`relative aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 ${reversed ? 'md:order-2' : ''}`}>
            <video 
              className="w-full h-full object-cover"
              controls={false}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={videoPoster}
            >
              {typeof videoUrl === 'string' && videoUrl.trim().length > 0 && (
                <source src={videoUrl} type="video/mp4" />
              )}
              Your browser does not support the video tag.
            </video>
        </div>
        <div className={`h-full w-full ${reversed ? 'md:order-1' : ''}`}>
          <ImageCarousel 
            images={carouselImages} 
            alt={`${title} gallery`}
            className="h-full w-full rounded-xl shadow-lg"
            aspectRatio="aspect-video"
          />
        </div>
      </div>
    </div>
  )
}

