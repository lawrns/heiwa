import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { HeroProps } from '@/lib/types'

export function Hero({ title, subtitle, image, ctas, className }: HeroProps) {
  return (
    <section
      className={cn('relative h-screen flex items-center justify-center overflow-hidden', className)}
      role="banner"
      aria-labelledby="hero-title"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          /* Gradient background when no image */
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-surface" />
        )}
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtitle - A WAVE AWAY */}
        <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 tracking-widest uppercase font-normal">
          {subtitle}
        </p>

        <h1
          id="hero-title"
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-normal text-white mb-8 leading-tight max-w-4xl mx-auto"
        >
          {title}
        </h1>

        {/* CTA Buttons */}
        {ctas && ctas.length > 0 && (
          <div className="flex justify-center">
            {ctas.map((cta, index) => (
              <Link
                key={cta.label}
                href={cta.href}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-accent-hover text-white text-sm font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
