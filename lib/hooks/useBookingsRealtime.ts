import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  type: 'room' | 'surf_camp'
  item_name: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  created_at: string
  special_requests?: string
}

type BookingEvent = 'INSERT' | 'UPDATE' | 'DELETE'

interface UseBookingsRealtimeOptions {
  onInsert?: (booking: Booking) => void
  onUpdate?: (booking: Booking) => void
  onDelete?: (bookingId: string) => void
  onError?: (error: Error) => void
  onConnect?: (connected: boolean) => void
}

export function useBookingsRealtime(options: UseBookingsRealtimeOptions = {}) {
  // Use refs to store callbacks so they don't trigger re-subscriptions
  const callbacksRef = useRef(options)
  
  // Update refs when options change (without triggering re-subscription)
  useEffect(() => {
    callbacksRef.current = options
  }, [options])

  useEffect(() => {
    let subscription: any = null
    let isSubscribed = false

    const setupRealtimeSubscription = async () => {
      // Prevent multiple subscriptions
      if (isSubscribed) {
        return
      }

      try {
        // Subscribe to all changes on the bookings table
        subscription = supabase
          .channel('bookings_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
            },
            (payload: any) => {
              try {
                const event = payload.eventType as BookingEvent
                const callbacks = callbacksRef.current

                if (event === 'INSERT' && payload.new) {
                  const newBooking = transformBookingData(payload.new)
                  callbacks.onInsert?.(newBooking)
                } else if (event === 'UPDATE' && payload.new) {
                  const updatedBooking = transformBookingData(payload.new)
                  callbacks.onUpdate?.(updatedBooking)
                } else if (event === 'DELETE' && payload.old) {
                  callbacks.onDelete?.(payload.old.id)
                }
              } catch (err) {
                const callbacks = callbacksRef.current
                if (process.env.NODE_ENV === 'development') {
                  console.error('Error processing realtime event:', err)
                }
                callbacks.onError?.(err instanceof Error ? err : new Error('Unknown error'))
              }
            }
          )
          .subscribe((status: string) => {
            const callbacks = callbacksRef.current
            // Suppress all status logs - they're too noisy
            if (status === 'SUBSCRIBED') {
              isSubscribed = true
              callbacks.onConnect?.(true)
            } else if (status === 'CLOSED') {
              isSubscribed = false
              callbacks.onConnect?.(false)
              // Don't log CLOSED - it's normal during reconnection
            } else if (status === 'CHANNEL_ERROR') {
              isSubscribed = false
              if (process.env.NODE_ENV === 'development') {
                console.error('❌ Real-time channel error')
              }
              callbacks.onConnect?.(false)
            }
          })
      } catch (err) {
        isSubscribed = false
        const callbacks = callbacksRef.current
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to setup realtime subscription:', err)
        }
        callbacks.onError?.(err instanceof Error ? err : new Error('Failed to setup subscription'))
        callbacks.onConnect?.(false)
      }
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      isSubscribed = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, []) // Empty deps - only setup once, use refs for callbacks
}

/**
 * Transform database booking data to match Booking interface
 */
function transformBookingData(data: any): Booking {
  return {
    id: data.id,
    guest_name: data.guest_name || '',
    guest_email: data.guest_email || '',
    guest_phone: data.guest_phone || '',
    type: data.type || 'room',
    item_name: data.item_name || '',
    check_in: data.check_in || '',
    check_out: data.check_out || '',
    guests: data.guests || 1,
    total_price: data.total_price || 0,
    status: data.status || 'pending',
    payment_status: data.payment_status || 'pending',
    created_at: data.created_at || new Date().toISOString(),
    special_requests: data.special_requests,
  }
}
