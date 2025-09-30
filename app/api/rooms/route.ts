import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// API endpoint for getting all rooms (compatible with booking widget)
export async function GET(request: NextRequest) {
  try {
    console.log('🏠 Fetching all rooms for booking widget')

    // Get all active rooms (handle both isActive and is_active field names)
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('name')
    
    // Filter active rooms in code since field name might vary
    const activeRooms = (rooms || []).filter((room: { isActive?: boolean; is_active?: boolean }) =>
      room.isActive !== false && room.is_active !== false
    )

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms'
      }, { status: 500 })
    }

    console.log('✅ Rooms fetched successfully:', activeRooms.length)

    // Transform rooms to match booking widget expected format
    const transformedRooms = activeRooms.map((room: {
      id: string
      name: string
      description?: string
      capacity: number
      bookingType?: string
      pricing?: { standard?: number; offSeason?: number }
      amenities?: string[]
      images?: string[]
      isActive?: boolean
    }) => {
      // Calculate price_per_night from pricing object
      const pricePerNight = room.pricing?.standard || room.pricing?.offSeason || 80

      return {
        id: room.id,
        name: room.name,
        description: room.description || `Comfortable accommodation with capacity for ${room.capacity} guests`,
        capacity: room.capacity,
        booking_type: room.bookingType || 'whole',
        price_per_night: pricePerNight,
        amenities: room.amenities || [],
        featured_image: room.images && room.images.length > 0 ? room.images[0] : null,
        images: room.images || [],
        is_active: room.isActive !== false,
      }
    })

    console.log('✅ Transformed rooms:', transformedRooms.map((r: {
      id: string
      name: string
      featured_image: string | null
      images: string[]
    }) => ({
      id: r.id,
      name: r.name,
      has_image: !!r.featured_image,
      image_count: r.images?.length || 0
    })))

    return NextResponse.json({
      success: true,
      data: {
        rooms: transformedRooms
      }
    })

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
