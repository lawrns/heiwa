// Booking widget integration utilities for Heiwa House website
// Connects to the wavecampdashboard booking system

import { supabase } from './supabase'
import { env } from '@/config/environment'
import type { BookingInquiry, RoomAvailability, SurfCampBooking } from './supabase'

// Booking widget configuration
export interface BookingWidgetConfig {
  widgetUrl: string
  apiBaseUrl: string
  position: 'inline' | 'floating'
  primaryColor: string
  triggerText: string
  apiKey: string
}

// Default configuration using centralized environment config
export const defaultBookingConfig: BookingWidgetConfig = {
  widgetUrl: env.booking.widgetUrl,
  apiBaseUrl: env.booking.apiBaseUrl,
  position: 'inline',
  primaryColor: '#E85A2B', // Heiwa House brand color
  triggerText: 'Book Now',
  apiKey: 'heiwa_wp_test_key_2024_secure_deployment'
}

// Booking widget utilities
export class BookingWidgetService {
  private config: BookingWidgetConfig

  constructor(config: Partial<BookingWidgetConfig> = {}) {
    this.config = { ...defaultBookingConfig, ...config }
  }

  // Submit a room booking inquiry
  async submitRoomBooking(inquiry: Omit<BookingInquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BookingInquiry> {
    try {
      const bookingData = {
        ...inquiry,
        status: 'pending' as const,
        source: 'website',
        property: 'heiwa-house'
      }

      const response = await fetch(`${this.config.apiBaseUrl}/wordpress/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) {
        throw new Error(`Booking submission failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting room booking:', error)
      throw error
    }
  }

  // Submit a surf camp booking
  async submitSurfCampBooking(booking: Omit<SurfCampBooking, 'id' | 'status' | 'createdAt'>): Promise<SurfCampBooking> {
    try {
      const bookingData = {
        ...booking,
        status: 'inquiry' as const,
        source: 'website'
      }

      const response = await fetch(`${this.config.apiBaseUrl}/wordpress/surf-camps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(bookingData)
      })

      if (!response.ok) {
        throw new Error(`Surf camp booking submission failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting surf camp booking:', error)
      throw error
    }
  }

  // Check room availability
  async checkRoomAvailability(checkIn: string, checkOut: string, roomId?: string): Promise<RoomAvailability[]> {
    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        ...(roomId && { roomId })
      })

      const response = await fetch(`${this.config.apiBaseUrl}/wordpress/rooms/availability?${params}`, {
        headers: {
          'X-API-Key': this.config.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Availability check failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error checking room availability:', error)
      throw error
    }
  }

  // Get booking widget embed code
  getWidgetEmbedCode(containerId: string = 'heiwa-booking-widget'): string {
    const config = {
      ajaxUrl: `${this.config.apiBaseUrl}/wordpress/`,
      nonce: 'wp_rest_nonce_' + Date.now(),
      restBase: `${this.config.apiBaseUrl}/wordpress/heiwa/v1`,
      pluginUrl: '/wordpress-plugin/heiwa-booking-widget/',
      buildId: 'react-widget-' + Date.now(),
      settings: {
        apiEndpoint: this.config.apiBaseUrl,
        apiKey: this.config.apiKey,
        position: this.config.position,
        primaryColor: this.config.primaryColor,
        triggerText: this.config.triggerText
      }
    }

    return `
      <div
        id="${containerId}"
        class="heiwa-react-widget-container heiwa-position-${this.config.position}"
        data-widget-id="heiwa-widget-${Date.now()}"
        data-build-id="${config.buildId}"
      >
        <script>
          window.heiwaWidgetConfig = ${JSON.stringify(config)};
        </script>
        <script src="${this.config.widgetUrl}/widget.js"></script>
      </div>
    `
  }

  // Initialize widget on client side
  initializeWidget(containerId: string = 'heiwa-booking-widget'): void {
    if (typeof window === 'undefined') return

    const config = {
      ajaxUrl: `${this.config.apiBaseUrl}/wordpress/`,
      nonce: 'wp_rest_nonce_' + Date.now(),
      restBase: `${this.config.apiBaseUrl}/wordpress/heiwa/v1`,
      pluginUrl: '/wordpress-plugin/heiwa-booking-widget/',
      buildId: 'react-widget-' + Date.now(),
      settings: {
        apiEndpoint: this.config.apiBaseUrl,
        apiKey: this.config.apiKey,
        position: this.config.position,
        primaryColor: this.config.primaryColor,
        triggerText: this.config.triggerText
      }
    }

    // Set global config for the widget
    ;(window as any).heiwaWidgetConfig = config

    // Load widget script if not already loaded
    if (!(window as any).heiwaWidgetLoaded) {
      const script = document.createElement('script')
      script.src = `${this.config.widgetUrl}/widget.js`
      script.async = true
      document.head.appendChild(script)
      ;(window as any).heiwaWidgetLoaded = true
    }
  }
}

// Singleton instance for easy access
export const bookingWidgetService = new BookingWidgetService()

// Utility functions for common booking operations
export const submitBookingInquiry = (inquiry: Omit<BookingInquiry, 'id' | 'status' | 'createdAt' | 'updatedAt'>) =>
  bookingWidgetService.submitRoomBooking(inquiry)

export const checkAvailability = (checkIn: string, checkOut: string, roomId?: string) =>
  bookingWidgetService.checkRoomAvailability(checkIn, checkOut, roomId)

export const getWidgetEmbedCode = (containerId?: string) =>
  bookingWidgetService.getWidgetEmbedCode(containerId)

export const initializeBookingWidget = (containerId?: string) =>
  bookingWidgetService.initializeWidget(containerId)
