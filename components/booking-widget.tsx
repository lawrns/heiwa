'use client'

import { useEffect, useRef, useState } from 'react'
import { initializeBookingWidget, getWidgetEmbedCode } from '@/lib/booking-widget'
import { cn } from '@/lib/utils'

interface BookingWidgetProps {
  containerId?: string
  className?: string
  title?: string
}

export function BookingWidget({
  containerId = 'heiwa-booking-widget',
  className,
  title = 'Book Your Stay'
}: BookingWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize the booking widget when component mounts
    try {
      initializeBookingWidget(containerId)
      setIsLoaded(true)
    } catch (err) {
      console.error('Failed to initialize booking widget:', err)
      setError('Booking system temporarily unavailable')
    }
  }, [containerId])

  if (error) {
    return (
      <div className={cn('bg-surface rounded-card p-6 text-center', className)}>
        <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
        <p className="text-muted text-sm">{error}</p>
        <p className="text-muted text-xs mt-2">
          Please contact us directly at{' '}
          <a href="mailto:info@heiwahouse.com" className="text-primary hover:underline">
            info@heiwahouse.com
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className={cn('bg-surface rounded-card p-6', className)}>
      <h3 className="text-lg font-semibold text-text mb-4 text-center">{title}</h3>

      <div
        ref={containerRef}
        id={containerId}
        className="heiwa-react-widget-container heiwa-position-inline min-h-[400px]"
        data-widget-id={`heiwa-widget-${Date.now()}`}
        data-build-id={`react-widget-${Date.now()}`}
        role="region"
        aria-label="Booking widget"
      >
        {!isLoaded && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted text-sm">Loading booking system...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-muted text-xs">
          Powered by Heiwa House Booking System
        </p>
      </div>
    </div>
  )
}

// Server-side embed code generator for static rendering
export function getBookingWidgetEmbed(props: BookingWidgetProps = {}): string {
  const { containerId = 'heiwa-booking-widget', title } = props

  return `
    <div class="bg-surface rounded-card p-6">
      ${title ? `<h3 class="text-lg font-semibold text-text mb-4 text-center">${title}</h3>` : ''}
      ${getWidgetEmbedCode(containerId)}
      <div class="mt-4 text-center">
        <p class="text-muted text-xs">Powered by Heiwa House Booking System</p>
      </div>
    </div>
  `
}
