'use client'

import { Calendar, Users } from 'lucide-react'
import { StandaloneWidget } from './BookingWidget/StandaloneWidget'
import { useBooking } from '@/lib/booking-context'

export function FloatingBookingWidget() {
  const { isBookingOpen, openBooking, closeBooking } = useBooking()

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <button
          onClick={openBooking}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-3 font-medium text-lg hover:scale-105"
        >
          <Calendar size={22} />
          <span className="font-semibold">Check Availability</span>
          <Users size={22} />
        </button>
      </div>

      {/* React Booking Widget - Direct render when open */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBooking}
          />

          {/* StandaloneWidget positioned on the right */}
          <div className="absolute top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-hidden">
            <StandaloneWidget
              config={{
                ajaxUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/wp-json/wp/v2/`,
                nonce: 'wp_rest_nonce_12345',
                restBase: `${typeof window !== 'undefined' ? window.location.origin : ''}/wp-json/heiwa/v1`,
                pluginUrl: '/wordpress-plugin/heiwa-booking-widget/',
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
