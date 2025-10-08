'use client'

import { StandaloneWidget } from './BookingWidget/StandaloneWidget'
// import { useBooking } from '@/lib/booking-context'

export function FloatingBookingWidget() {
  // const { isBookingOpen, closeBooking } = useBooking()
  const isBookingOpen = false
  const closeBooking = () => {}

  return (
    <>
      {/* React Booking Widget - Direct render when open */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBooking}
          />

          {/* StandaloneWidget positioned on the right */}
          <div className="absolute top-0 right-0 h-full w-full max-w-lg shadow-2xl overflow-hidden">
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
