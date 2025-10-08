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
    <div className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {/* Background Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        
        {/* Learn More Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            href={href}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            style={{ backgroundColor: '#ec681c' }}
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Content Below Image */}
      <div className="p-6 bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

