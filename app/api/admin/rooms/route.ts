import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

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

// POST /api/admin/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description,
      capacity, 
      price_per_night,
      pricing: pricingInput,
      booking_type,
      amenities, 
      featured_image,
      images, 
      is_active 
    } = body

    // Validate required fields
    if (!name || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Name and capacity are required' },
        { status: 400 }
      )
    }

    // Build pricing object - support both old format (price_per_night) and new format (pricing object)
    let pricing
    if (pricingInput) {
      // New format with full pricing structure including surfCamp
      pricing = {
        standard: pricingInput.standard || 0,
        offSeason: pricingInput.offSeason || pricingInput.standard || 0,
        ...(pricingInput.surfCamp && { surfCamp: pricingInput.surfCamp })
      }
    } else {
      // Legacy format with price_per_night
      pricing = {
        standard: price_per_night || 0,
        offSeason: price_per_night ? Math.round(price_per_night * 0.8) : 0
      }
    }

    // Prepare images array - include featured_image as first image if provided
    const roomImages = featured_image 
      ? [featured_image, ...(images || [])]
      : (images || [])

    const insertData = {
      name,
      description: description || '',
      capacity,
      pricing,
      amenities: amenities || [],
      images: roomImages,
      is_active: is_active !== false,
      booking_type: booking_type || 'whole',
      bed_types: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating room:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create room' },
        { status: 500 }
      )
    }

    // Revalidate rooms pages
    revalidatePath('/rooms')
    revalidatePath('/admin/rooms')
    revalidatePath('/')

    return NextResponse.json({
      success: true,
      data: { room: data }
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { 
      status: 500
    })
  }
}

