'use client'

import { Calendar, Users, X } from 'lucide-react'
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
          className="bg-primary hover:bg-accent-hover text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-3 font-medium text-lg hover:scale-105"
        >
          <Calendar size={22} />
          <span className="font-semibold">Check Availability</span>
          <Users size={22} />
        </button>
      </div>

      {/* Booking Widget Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBooking}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-heading font-semibold text-text">
                Book Your Stay
              </h2>
              <button
                onClick={closeBooking}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            
            {/* Working Booking Widget from wavecampdashboard */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                className="heiwa-page-integration"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
