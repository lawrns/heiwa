'use client'

import Image from 'next/image'
import Link from 'next/link'

interface FeatureCardProps {
  title: string
  description: string
  image: string
  href: string
  className?: string
}

export function FeatureCard({ title, description, image, href, className = '' }: FeatureCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation ${className}`}>
      {/* Background Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 group-active:bg-black/40 transition-colors" />
        
        {/* Learn More Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            href={href}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-accent hover:bg-accent-hover active:bg-accent-dark text-white font-semibold rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 min-h-[44px] flex items-center justify-center text-sm sm:text-base"
            style={{ backgroundColor: '#ec681c' }}
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Content Below Image */}
      <div className="p-4 sm:p-6 bg-white">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{description}</p>
      </div>
    </div>
  )
}



