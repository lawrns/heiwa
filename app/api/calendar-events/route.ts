import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const adminAuth = request.cookies.get('admin_auth')?.value
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'heiwa_admin_2024'

    if (!adminAuth || adminAuth !== adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const events: any[] = []

    // Fetch bookings and convert to calendar events
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id, items, status, payment_status, client_ids, created_at')
      .order('created_at', { ascending: false })

    if (!bookingsError && bookings) {
      // Fetch clients for guest names
      const allClientIds = new Set<string>()
      bookings.forEach((booking: any) => {
        if (booking.client_ids && Array.isArray(booking.client_ids)) {
          booking.client_ids.forEach((id: string) => allClientIds.add(id))
        }
      })

      let clientMap = new Map()
      if (allClientIds.size > 0) {
        const { data: clients } = await supabaseAdmin
          .from('clients')
          .select('id, name')
          .in('id', Array.from(allClientIds))

        if (clients) {
          clients.forEach((client: any) => {
            clientMap.set(client.id, client.name || 'Unknown')
          })
        }
      }

      // Collect surf camp IDs to fetch in batch
      const surfCampIds = new Set<string>()
      bookings.forEach((booking: any) => {
        const firstItem = booking.items?.[0]
        if (firstItem?.type === 'surfCamp' && firstItem.itemId) {
          surfCampIds.add(firstItem.itemId)
        }
      })

      // Fetch all surf camps in one query
      let surfCampMap = new Map()
      if (surfCampIds.size > 0) {
        const { data: camps } = await supabaseAdmin
          .from('surf_camps')
          .select('id, name, start_date, end_date')
          .in('id', Array.from(surfCampIds))

        if (camps) {
          camps.forEach((camp: any) => {
            surfCampMap.set(camp.id, camp)
          })
        }
      }

      // Convert bookings to calendar events
      bookings.forEach((booking: any) => {
        const firstItem = booking.items?.[0]
        if (!firstItem) return

        const guestName = booking.client_ids && booking.client_ids.length > 0
          ? (clientMap.get(booking.client_ids[0]) || 'Unknown Guest')
          : 'Unknown Guest'

        if (firstItem.type === 'room' && firstItem.dates?.checkIn && firstItem.dates?.checkOut) {
          events.push({
            id: `booking-${booking.id}`,
            title: `Booking: ${guestName}`,
            description: `Room booking - ${booking.status}`,
            start_date: firstItem.dates.checkIn,
            end_date: firstItem.dates.checkOut,
            event_type: 'booking',
            location: 'Heiwa House',
            color: booking.status === 'confirmed' ? 'blue' : booking.status === 'pending' ? 'yellow' : 'gray',
            created_at: booking.created_at
          })
        } else if (firstItem.type === 'surfCamp') {
          // Use pre-fetched surf camp data
          const camp = surfCampMap.get(firstItem.itemId)
          if (camp && camp.start_date) {
            events.push({
              id: `booking-surf-${booking.id}`,
              title: `Surf Camp Booking: ${camp.name}`,
              description: `Surf camp booking - ${guestName}`,
              start_date: camp.start_date,
              end_date: camp.end_date || camp.start_date,
              event_type: 'surf_camp_booking',
              location: 'Heiwa House',
              color: 'green',
              created_at: booking.created_at
            })
          }
        }
      })
    }

    // Fetch surf camps as events
    const { data: surfCamps, error: surfCampsError } = await supabaseAdmin
      .from('surf_camps')
      .select('id, name, start_date, end_date, is_active')
      .eq('is_active', true)

    if (!surfCampsError && surfCamps) {
      surfCamps.forEach((camp: any) => {
        if (camp.start_date) {
          events.push({
            id: `camp-${camp.id}`,
            title: `Surf Camp: ${camp.name}`,
            description: 'Surf camp program',
            start_date: camp.start_date,
            end_date: camp.end_date || camp.start_date,
            event_type: 'surf_camp',
            location: 'Heiwa House',
            color: 'green',
            created_at: camp.start_date
          })
        }
      })
    }

    // Filter by date range if provided
    let filteredEvents = events
    if (startDate && endDate) {
      filteredEvents = events.filter(event => {
        const eventStart = new Date(event.start_date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return eventStart >= start && eventStart <= end
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents
      }
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
