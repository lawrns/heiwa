// Scheduled Email Service
// Handles automated sending of pre-trip and post-trip emails based on booking dates

import { supabaseAdmin } from '@/lib/supabase'
import { emailService, PreTripEmailData, PostTripFeedbackData } from './email-service'

interface BookingWithClient {
  id: string
  client_ids: string[]
  items: any[]
  check_in?: string
  check_out?: string
  pre_trip_email_sent_at: string | null
  post_trip_email_sent_at: string | null
  pre_trip_email_days_before: number
  clients?: Array<{
    id: string
    name: string
    email: string
    phone?: string
  }>
  surf_camp?: {
    name: string
    start_date: string
    end_date: string
  }
  room?: {
    name: string
  }
}

class ScheduledEmailService {
  /**
   * Calculate days until check-in from booking items
   */
  private getCheckInDate(booking: BookingWithClient): Date | null {
    // Try to get check-in from booking items
    if (booking.items && booking.items.length > 0) {
      const firstItem = booking.items[0]
      if (firstItem.dates?.checkIn) {
        return new Date(firstItem.dates.checkIn)
      }
    }
    
    // Fallback to check_in field if available
    if (booking.check_in) {
      return new Date(booking.check_in)
    }
    
    // For surf camps, use start_date
    if (booking.surf_camp?.start_date) {
      return new Date(booking.surf_camp.start_date)
    }
    
    return null
  }

  /**
   * Calculate check-out date from booking items
   */
  private getCheckOutDate(booking: BookingWithClient): Date | null {
    // Try to get check-out from booking items
    if (booking.items && booking.items.length > 0) {
      const firstItem = booking.items[0]
      if (firstItem.dates?.checkOut) {
        return new Date(firstItem.dates.checkOut)
      }
    }
    
    // Fallback to check_out field if available
    if (booking.check_out) {
      return new Date(booking.check_out)
    }
    
    // For surf camps, use end_date
    if (booking.surf_camp?.end_date) {
      return new Date(booking.surf_camp.end_date)
    }
    
    return null
  }

  /**
   * Send pre-trip emails for bookings that are X days before check-in
   */
  async sendPreTripEmails(daysBefore: number = 7): Promise<{ sent: number; errors: number }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() + daysBefore)
    targetDate.setHours(23, 59, 59, 999)
    
    console.log(`📧 Checking for bookings with check-in on ${targetDate.toISOString().split('T')[0]} (${daysBefore} days from today)`)

    try {
      // Query bookings that:
      // 1. Have a check-in date matching our target date
      // 2. Haven't had pre-trip email sent yet
      // 3. Have confirmed status
      const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          id,
          client_ids,
          items,
          check_in,
          check_out,
          pre_trip_email_sent_at,
          pre_trip_email_days_before,
          status,
          payment_status
        `)
        .eq('status', 'confirmed')
        .is('pre_trip_email_sent_at', null)

      if (error) {
        console.error('Error fetching bookings for pre-trip emails:', error)
        return { sent: 0, errors: 1 }
      }

      if (!bookings || bookings.length === 0) {
        console.log('No bookings found needing pre-trip emails')
        return { sent: 0, errors: 0 }
      }

      let sent = 0
      let errors = 0

      for (const booking of bookings as BookingWithClient[]) {
        const checkInDate = this.getCheckInDate(booking)
        if (!checkInDate) {
          console.warn(`Booking ${booking.id} has no check-in date, skipping`)
          continue
        }

        // Check if this booking's check-in matches our target date
        const checkInDateStr = checkInDate.toISOString().split('T')[0]
        const targetDateStr = targetDate.toISOString().split('T')[0]
        
        if (checkInDateStr !== targetDateStr) {
          continue
        }

        // Fetch client details
        if (!booking.client_ids || booking.client_ids.length === 0) {
          console.warn(`Booking ${booking.id} has no clients, skipping`)
          continue
        }

        const { data: clients } = await supabaseAdmin
          .from('clients')
          .select('id, name, email, phone')
          .in('id', booking.client_ids)

        if (!clients || clients.length === 0) {
          console.warn(`No clients found for booking ${booking.id}, skipping`)
          continue
        }

        const primaryClient = clients[0]
        const checkOutDate = this.getCheckOutDate(booking)
        
        // Determine booking type and name
        const firstItem = booking.items?.[0]
        const isSurfCamp = firstItem?.type === 'surfCamp'
        const campId = isSurfCamp ? firstItem?.itemId : null
        const roomId = !isSurfCamp ? firstItem?.itemId : null

        // Fetch surf camp or room details if needed
        let surfCampName: string | undefined
        let roomName: string | undefined

        if (campId) {
          const { data: surfCamp } = await supabaseAdmin
            .from('surf_camps')
            .select('name, start_date, end_date')
            .eq('id', campId)
            .single()
          surfCampName = surfCamp?.name
        }

        if (roomId) {
          const { data: room } = await supabaseAdmin
            .from('rooms')
            .select('name')
            .eq('id', roomId)
            .single()
          roomName = room?.name
        }

        const preTripData: PreTripEmailData = {
          bookingId: booking.id,
          guestName: primaryClient.name,
          guestEmail: primaryClient.email,
          checkIn: checkInDate.toISOString(),
          checkOut: checkOutDate?.toISOString() || checkInDate.toISOString(),
          bookingType: isSurfCamp ? 'surfCamp' : 'room',
          surfCampName,
          roomName,
          daysUntilTrip: daysBefore,
          // Default packing list and tips can be customized per booking type
          packingList: this.getDefaultPackingList(isSurfCamp),
          travelTips: this.getDefaultTravelTips()
          // Affiliate links removed - placeholder URLs not suitable for production
        }

        const result = await emailService.sendPreTripEmail(preTripData)

        if (result.success) {
          // Mark email as sent
          await supabaseAdmin
            .from('bookings')
            .update({ pre_trip_email_sent_at: new Date().toISOString() })
            .eq('id', booking.id)

          console.log(`✅ Sent pre-trip email for booking ${booking.id} to ${primaryClient.email}`)
          sent++
        } else {
          console.error(`❌ Failed to send pre-trip email for booking ${booking.id}:`, result.error)
          errors++
        }
      }

      return { sent, errors }
    } catch (error: any) {
      console.error('Error in sendPreTripEmails:', error)
      return { sent: 0, errors: 1 }
    }
  }

  /**
   * Send post-trip feedback emails for bookings that ended X days ago
   */
  async sendPostTripFeedbackEmails(daysAfter: number = 1): Promise<{ sent: number; errors: number }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() - daysAfter)
    targetDate.setHours(23, 59, 59, 999)
    
    console.log(`📧 Checking for bookings with check-out on ${targetDate.toISOString().split('T')[0]} (${daysAfter} days ago)`)

    try {
      // Query bookings that:
      // 1. Have a check-out date matching our target date
      // 2. Haven't had post-trip email sent yet
      // 3. Have completed status
      const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          id,
          client_ids,
          items,
          check_in,
          check_out,
          post_trip_email_sent_at,
          status
        `)
        .in('status', ['completed', 'confirmed'])
        .is('post_trip_email_sent_at', null)

      if (error) {
        console.error('Error fetching bookings for post-trip emails:', error)
        return { sent: 0, errors: 1 }
      }

      if (!bookings || bookings.length === 0) {
        console.log('No bookings found needing post-trip emails')
        return { sent: 0, errors: 0 }
      }

      let sent = 0
      let errors = 0

      for (const booking of bookings as BookingWithClient[]) {
        const checkOutDate = this.getCheckOutDate(booking)
        if (!checkOutDate) {
          console.warn(`Booking ${booking.id} has no check-out date, skipping`)
          continue
        }

        // Check if this booking's check-out matches our target date
        const checkOutDateStr = checkOutDate.toISOString().split('T')[0]
        const targetDateStr = targetDate.toISOString().split('T')[0]
        
        if (checkOutDateStr !== targetDateStr) {
          continue
        }

        // Fetch client details
        if (!booking.client_ids || booking.client_ids.length === 0) {
          console.warn(`Booking ${booking.id} has no clients, skipping`)
          continue
        }

        const { data: clients } = await supabaseAdmin
          .from('clients')
          .select('id, name, email, phone')
          .in('id', booking.client_ids)

        if (!clients || clients.length === 0) {
          console.warn(`No clients found for booking ${booking.id}, skipping`)
          continue
        }

        const primaryClient = clients[0]
        const checkInDate = this.getCheckInDate(booking)
        
        // Determine booking type and name
        const firstItem = booking.items?.[0]
        const isSurfCamp = firstItem?.type === 'surfCamp'
        const campId = isSurfCamp ? firstItem?.itemId : null
        const roomId = !isSurfCamp ? firstItem?.itemId : null

        // Fetch surf camp or room details if needed
        let surfCampName: string | undefined
        let roomName: string | undefined

        if (campId) {
          const { data: surfCamp } = await supabaseAdmin
            .from('surf_camps')
            .select('name')
            .eq('id', campId)
            .single()
          surfCampName = surfCamp?.name
        }

        if (roomId) {
          const { data: room } = await supabaseAdmin
            .from('rooms')
            .select('name')
            .eq('id', roomId)
            .single()
          roomName = room?.name
        }

        const postTripData: PostTripFeedbackData = {
          bookingId: booking.id,
          guestName: primaryClient.name,
          guestEmail: primaryClient.email,
          checkIn: checkInDate?.toISOString() || '',
          checkOut: checkOutDate.toISOString(),
          bookingType: isSurfCamp ? 'surfCamp' : 'room',
          surfCampName,
          roomName,
          // Feedback form removed - route not implemented
          // reviewLinks removed - placeholder URLs replaced with contact email
          returnOffer: {
            discount: 10,
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days from now
          }
        }

        const result = await emailService.sendPostTripFeedbackRequest(postTripData)

        if (result.success) {
          // Mark email as sent
          await supabaseAdmin
            .from('bookings')
            .update({ post_trip_email_sent_at: new Date().toISOString() })
            .eq('id', booking.id)

          console.log(`✅ Sent post-trip feedback email for booking ${booking.id} to ${primaryClient.email}`)
          sent++
        } else {
          console.error(`❌ Failed to send post-trip email for booking ${booking.id}:`, result.error)
          errors++
        }
      }

      return { sent, errors }
    } catch (error: any) {
      console.error('Error in sendPostTripFeedbackEmails:', error)
      return { sent: 0, errors: 1 }
    }
  }

  /**
   * Get default packing list based on booking type
   */
  private getDefaultPackingList(isSurfCamp: boolean): string[] {
    const baseList = [
      'Swimsuit / Wetsuit',
      'Sunscreen (SPF 50+)',
      'Beach towel',
      'Comfortable clothing',
      'Water bottle',
      'Camera / GoPro',
      'Travel adapter (if needed)'
    ]

    if (isSurfCamp) {
      return [
        ...baseList,
        'Surfboard (or rent from us)',
        'Rash guard',
        'Surf wax',
        'Leash'
      ]
    }

    return baseList
  }

  /**
   * Get default travel tips
   */
  private getDefaultTravelTips(): string[] {
    return [
      'Arrive at least 30 minutes early for surf lessons',
      'Stay hydrated - bring water to the beach',
      'Check the surf forecast daily',
      'Respect local surf etiquette',
      'Protect yourself from the sun',
      'Bring cash for local vendors and tips'
    ]
  }

}

// Export singleton instance
export const scheduledEmailService = new ScheduledEmailService()
export default scheduledEmailService

