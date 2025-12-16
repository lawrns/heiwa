'use client'

import { useEffect } from 'react'
import { StandaloneWidget } from './BookingWidget/StandaloneWidget'
import { useBooking } from '@/lib/booking-context'

export function FloatingBookingWidget() {
  const { isBookingOpen, closeBooking, openBooking } = useBooking()

  // Listen for custom events to open booking widget globally
  useEffect(() => {
    const handleOpenBooking = () => {
      openBooking()
    }

    const handleOpenBookingForWeek = (event: CustomEvent) => {
      openBooking(event.detail)
    }

    window.addEventListener('openBooking', handleOpenBooking)
    window.addEventListener('openBookingForWeek', handleOpenBookingForWeek as EventListener)

    return () => {
      window.removeEventListener('openBooking', handleOpenBooking)
      window.removeEventListener('openBookingForWeek', handleOpenBookingForWeek as EventListener)
    }
  }, [openBooking])

  return (
    <>
      {/* React Booking Widget - Direct render when open */}
      {isBookingOpen && (
        <div className="fixed inset-0" style={{ zIndex: 'var(--z-modal)' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 'var(--z-modal-backdrop)' }}
            onClick={closeBooking}
          />

          {/* StandaloneWidget positioned on the right */}
          <div className="absolute top-0 right-0 h-full w-full sm:max-w-lg shadow-2xl overflow-hidden" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}>
            <StandaloneWidget
              config={{
                buildId: 'react-widget-heiwa-page',
                settings: {
                  apiEndpoint: `${typeof window !== 'undefined' ? window.location.origin : ''}/api`,
                  apiKey: 'heiwa_page_key_2024',
                  position: 'right',
                  primaryColor: '#f97316',
                  triggerText: 'BOOK NOW'
                }
              }}
              containerId="heiwa-booking-widget-modal"
              className="heiwa-page-integration h-full"
              isWebComponent={true}
              onModalStateChange={(isModalOpen) => {
                if (!isModalOpen) {
                  closeBooking()
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
