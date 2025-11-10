import { useEffect, useCallback } from 'react'
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
}

export function useBookingsRealtime(options: UseBookingsRealtimeOptions = {}) {
  const { onInsert, onUpdate, onDelete, onError } = options

  useEffect(() => {
    let subscription: any = null

    const setupRealtimeSubscription = async () => {
      try {
        // Use the existing Supabase client

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

                if (event === 'INSERT' && payload.new) {
                  const newBooking = transformBookingData(payload.new)
                  onInsert?.(newBooking)
                } else if (event === 'UPDATE' && payload.new) {
                  const updatedBooking = transformBookingData(payload.new)
                  onUpdate?.(updatedBooking)
                } else if (event === 'DELETE' && payload.old) {
                  onDelete?.(payload.old.id)
                }
              } catch (err) {
                console.error('Error processing realtime event:', err)
                onError?.(err instanceof Error ? err : new Error('Unknown error'))
              }
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('✅ Real-time bookings subscription active')
            } else if (status === 'CLOSED') {
              console.log('❌ Real-time bookings subscription closed')
            }
          })
      } catch (err) {
        console.error('Failed to setup realtime subscription:', err)
        onError?.(err instanceof Error ? err : new Error('Failed to setup subscription'))
      }
    }

    setupRealtimeSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [onInsert, onUpdate, onDelete, onError])
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
