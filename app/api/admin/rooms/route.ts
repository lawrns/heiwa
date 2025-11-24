import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Admin API endpoint for getting all rooms (including inactive)
export async function GET() {
  try {
    console.log('🏠 Admin: Fetching all rooms (including inactive)')

    // Get ALL rooms from database (no filter by is_active)
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .order('name')
    
    if (roomsError) {
      console.error('Error fetching rooms:', roomsError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms'
      }, { 
        status: 500
      })
    }

    const allRooms = rooms || []
    console.log('✅ Admin: Rooms fetched successfully:', allRooms.length)

    // Transform rooms to match admin UI expected format
    const transformedRooms = allRooms.map((room: any) => {
      // Pricing: Include both standard and offSeason rates
      const defaultPricePerNight = room.pricing?.standard || room.pricing?.offSeason || null

      // Get featured image from images array
      const featuredImage = room.images && Array.isArray(room.images) && room.images.length > 0 
        ? room.images[0] 
        : null

      return {
        id: room.id,
        name: room.name,
        description: room.description || `Comfortable accommodation with capacity for ${room.capacity} guests`,
        capacity: room.capacity || 0,
        price_per_night: defaultPricePerNight,
        featured_image: featuredImage,
        images: room.images || [],
        is_active: room.is_active !== false,
        amenities: room.amenities || [],
        booking_type: room.booking_type || 'whole',
        pricing: room.pricing,
        bed_types: room.bed_types || [],
      }
    })

    console.log('✅ Admin: Transformed rooms:', transformedRooms.map((r: any) => ({
      id: r.id,
      name: r.name,
      has_image: !!r.featured_image,
      image_url: r.featured_image,
      is_active: r.is_active
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
    }, { 
      status: 500
    })
  }
}

