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
        <Image
          src={image}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-surface/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1
          id="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-text mb-6 leading-tight"
        >
          {title}
        </h1>

        <p className="text-lg sm:text-xl lg:text-2xl text-muted mb-8 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* CTA Buttons */}
        {ctas && ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {ctas.map((cta, index) => (
              <Link
                key={index}
                href={cta.href}
                className={cn(
                  'inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface',
                  cta.variant === 'secondary'
                    ? 'bg-surface-alt text-text border border-muted hover:bg-surface hover:border-primary'
                    : 'btn-primary'
                )}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-muted rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  )
}
