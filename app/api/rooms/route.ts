import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Fix Supabase storage bucket name mismatch
 * Maps old /rooms/ bucket URLs to correct /room-images/ bucket
 */
function fixSupabaseBucketUrl(url: string): string {
  if (!url || typeof url !== 'string') return url;
  
  // Fix bucket name mismatch: /rooms/ -> /room-images/
  // The database has old URLs pointing to /rooms/ bucket which doesn't exist
  // The actual bucket is /room-images/
  if (url.includes('/storage/v1/object/public/rooms/') && !url.includes('/room-images/')) {
    return url.replace('/storage/v1/object/public/rooms/', '/storage/v1/object/public/room-images/');
  }
  
  return url;
}

// API endpoint for getting all rooms (compatible with booking widget)
export async function GET() {
  try {
    console.log('🏠 Fetching all rooms for booking widget')

    // Get all active rooms from database
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    // Use rooms directly as they're already filtered by is_active = true
    const activeRooms = rooms || []

    if (roomsError) {
      console.error('❌ Error fetching rooms:', roomsError)
      console.error('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')
      console.error('🔍 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
      
      // Return more specific error message
      const errorMessage = roomsError.message || 'Database connection error'
      const isConnectionError = errorMessage.includes('connect') || errorMessage.includes('timeout') || errorMessage.includes('network')
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch rooms',
        message: isConnectionError 
          ? 'Unable to connect to database. Please try again later.'
          : process.env.NODE_ENV === 'development' 
            ? `Database error: ${errorMessage}` 
            : 'Unable to load rooms. Please check server configuration.',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heiwa-API-Key',
        }
      })
    }

    console.log('✅ Rooms fetched successfully:', activeRooms.length)
    console.log('🔍 RAW DATABASE DATA:', JSON.stringify(activeRooms, null, 2))

    // Transform rooms to match UI expected format with proper field mapping
    const transformedRooms = activeRooms.map((room: any) => {
      // Pricing: Include both standard and offSeason rates
      // Don't calculate price_per_night here - let frontend calculate based on dates
      // Default to standard rate if available, otherwise offSeason
      const defaultPricePerNight = room.pricing?.standard || room.pricing?.offSeason || null

      // Fix bucket URLs: /rooms/ -> /room-images/
      const fixedImages = (room.images || []).map((img: string) => fixSupabaseBucketUrl(img));
      const fixedFeaturedImage = room.images && room.images.length > 0 
        ? fixSupabaseBucketUrl(room.images[0]) 
        : null;

      return {
        id: room.id,
        name: room.name,
        description: room.description || `Comfortable accommodation with capacity for ${room.capacity} guests`,
        capacity: room.capacity,
        bookingType: room.booking_type || 'whole', // Map from database booking_type
        pricing: room.pricing,
        amenities: room.amenities || [],
        images: fixedImages, // Apply bucket fix
        isActive: room.is_active !== false, // Map from database is_active
        bedTypes: room.bed_types || [], // Map from database bed_types
        // Keep original fields for backward compatibility
        booking_type: room.booking_type,
        is_active: room.is_active,
        // Include both rates for frontend to calculate based on dates
        price_per_night: defaultPricePerNight, // Fallback for compatibility
        price_per_night_standard: room.pricing?.standard || null,
        price_per_night_off_season: room.pricing?.offSeason || null,
        featured_image: fixedFeaturedImage, // Apply bucket fix
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heiwa-API-Key',
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error fetching rooms:', error)
    console.error('🔍 Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')
    console.error('🔍 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: process.env.NODE_ENV === 'development'
        ? `Unexpected error: ${error instanceof Error ? error.stack : String(error)}`
        : 'An unexpected error occurred. Please try again later.'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heiwa-API-Key',
      }
    })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Heiwa-API-Key',
    },
  })
}
