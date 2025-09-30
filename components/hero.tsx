import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { HeroProps } from '@/lib/types'

function renderBackgroundMedia(video?: string, image?: string) {
  if (video) {
    return (
      <video
        src={video}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.7)',
          transform: 'scale(1.02)' 
        }}
      />
    )
  }
  
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        priority
        sizes="100vw"
        style={{ filter: 'brightness(0.7)' }}
      />
    )
  }
  
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-surface" />
  )
}

export function Hero({ title, subtitle, image, video, ctas, className }: Readonly<HeroProps>) {
  return (
    <header
      className={cn('relative h-screen flex items-center justify-center overflow-hidden', className)}
      aria-labelledby="hero-title"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {renderBackgroundMedia(video, image)}
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtitle - A WAVE AWAY */}
        <p className="text-xs sm:text-sm lg:text-base text-white/95 mb-8 tracking-[0.3em] uppercase font-medium font-sans">
          {subtitle}
        </p>

        <h1
          id="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-heading font-light text-white mb-12 leading-tight max-w-5xl mx-auto"
          style={{ 
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: '1.1'
          }}
        >
          {title}
        </h1>

        {/* CTA Buttons */}
        {ctas && ctas.length > 0 && (
          <div className="flex justify-center gap-4">
            {ctas.map((cta) => (
              <Link
                key={cta.label}
                href={cta.href}
                className="inline-flex items-center justify-center px-8 py-4 bg-accent hover:bg-accent-hover text-white text-sm font-medium tracking-[0.15em] uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-md shadow-lg hover:shadow-xl"
                style={{
                  minWidth: '140px',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicator - more subtle */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-5 h-8 border border-white/40 rounded-full flex justify-center">
          <div className="w-0.5 h-2 bg-white/60 rounded-full mt-1.5 animate-bounce" />
        </div>
      </div>
    </header>
  )
}
