import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'

/**
 * Fix Supabase storage bucket URLs if needed
 * Ensures CMS images use correct bucket names
 */
function fixImageUrls(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return []
  return images.map(url => {
    if (!url || typeof url !== 'string') return url
    // Fix any old bucket name mismatches (if they exist)
    // Currently surf-camp-images bucket is correct, but this ensures future compatibility
    return url
  })
}

// TypeScript interface for surf camp data
interface SurfCamp {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  max_participants: number
  price: number
  level: string
  category: string
  images: string[]
  includes: string[]
  is_active: boolean
}

// API endpoint for getting all surf camps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const showAll = searchParams.get('admin') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    // Only admins can request inactive/past camps
    if (showAll) {
      const authError = requireAdminAuth(request)
      if (authError) return authError
    }
    
    // Build query - simplified without timeout wrapper (matching rooms API pattern)
    let query = supabaseAdmin
      .from('surf_camps')
      .select('*')
      .order('start_date', { ascending: true })

    // Only filter active camps for non-admin requests
    if (!showAll) {
      query = query.eq('is_active', true)
      
      // Filter out past surf weeks - only show future ones
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query = query.gte('end_date', today.toISOString().split('T')[0])
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit)
    }
    
    // Execute query directly (matching rooms API pattern for reliability)
    const { data: surfCamps, error: surfCampsError } = await query

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      console.error('🔍 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')
      console.error('🔍 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch surf camps',
        message: process.env.NODE_ENV === 'development' 
          ? `Database error: ${surfCampsError.message}` 
          : 'Unable to load surf camps. Please try again later.'
      }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    // Handle null data (connection failure)
    if (!surfCamps) {
      console.warn('⚠️ No surf camps data returned - returning empty array')
      return NextResponse.json({
        success: true,
        data: {
          surf_camps: []
        }
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    console.log('✅ Surf camps fetched successfully:', surfCamps.length)

    // Fetch all active rooms to calculate dynamic bed availability
    const { data: allRooms } = await supabaseAdmin
      .from('rooms')
      .select('id, name, capacity, booking_type')
      .eq('is_active', true)
    
    // Calculate total bed capacity across all rooms
    const totalBedCapacity = (allRooms || []).reduce((sum, room) => sum + (room.capacity || 0), 0)

    // Get enrollment counts for each surf camp
    const surfCampsWithAvailability = await Promise.all(
      (surfCamps || []).map(async (camp: SurfCamp) => {
        // Count both confirmed and pending enrollments (pending = booked but not yet paid)
        const { count: enrolledCount, error: enrollmentError } = await supabaseAdmin
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .in('status', ['confirmed', 'pending'])
        
        if (enrollmentError) {
          console.warn(`Error fetching enrollment count for camp ${camp.id}:`, enrollmentError)
        }

        // DYNAMIC AVAILABILITY: Calculate actual available beds for this camp's dates
        // This accounts for room assignments that block beds even if not all beds are used
        let dynamicAvailableBeds = totalBedCapacity

        try {
          // Get room assignments that overlap with this camp's dates
          // Use > (not >=) for check_out_date because checkout day = checkin day is not a conflict
          // A guest checking out on July 10 doesn't block a new guest checking in July 10
          const { data: roomAssignments } = await supabaseAdmin
            .from('room_assignments')
            .select('room_id')
            .gt('check_out_date', camp.start_date)
            .lt('check_in_date', camp.end_date)

          if (roomAssignments && roomAssignments.length > 0) {
            // Count assignments per room
            const assignmentCountByRoom = new Map<string, number>()
            roomAssignments.forEach((ra: { room_id: string }) => {
              assignmentCountByRoom.set(ra.room_id, (assignmentCountByRoom.get(ra.room_id) || 0) + 1)
            })

            // Calculate remaining beds per room
            dynamicAvailableBeds = (allRooms || []).reduce((sum, room) => {
              const assignedInRoom = assignmentCountByRoom.get(room.id) || 0
              const roomCapacity = room.capacity || 0
              const roomBookingType = room.booking_type || 'whole'
              
              // For "whole" room types, if ANY assignment exists, the entire room is blocked
              if (roomBookingType === 'whole' && assignedInRoom > 0) {
                return sum // Room is fully blocked, add 0 beds
              }
              
              // For "perBed" rooms (dorms), subtract assigned beds from capacity
              const remainingBeds = Math.max(0, roomCapacity - assignedInRoom)
              return sum + remainingBeds
            }, 0)
          }
        } catch (roomError) {
          console.warn(`Error calculating room availability for camp ${camp.id}:`, roomError)
          // Fall back to enrollment-based calculation if room query fails
        }
        
        // Use max_participants as the primary source, fall back to total_spots for legacy data
        const totalSpots = camp.max_participants || (camp as any).total_spots || 18
        
        // Available spots is the MINIMUM of:
        // 1. max_participants - enrolled (admin-set limit minus people already signed up)
        // 2. dynamicAvailableBeds (actual beds available based on room assignments)
        const spotsBasedOnEnrollment = totalSpots - (enrolledCount || 0)
        const availableSpots = Math.max(0, Math.min(spotsBasedOnEnrollment, dynamicAvailableBeds))
        
        // Calculate the effective "booked" count for UI display
        // This accounts for BOTH enrollments AND beds blocked by room assignments
        // booked_count = total_spots - available_spots (reflects true unavailability)
        const bookedCount = totalSpots - availableSpots

        return {
          id: camp.id,
          name: camp.name,
          description: camp.description,
          start_date: camp.start_date,
          end_date: camp.end_date,
          price: camp.price,
          max_participants: totalSpots,
          total_spots: totalSpots,
          available_spots: availableSpots,
          available_beds: dynamicAvailableBeds, // actual bed availability
          enrolled_count: enrolledCount || 0, // kept for backwards compatibility
          booked_count: bookedCount, // NEW: effective booked count for UI (enrollments + blocked beds)
          is_full: availableSpots <= 0,
          level: camp.level || 'all',
          category: camp.category,
          images: fixImageUrls(camp.images || []),
          includes: camp.includes || [],
          is_active: camp.is_active,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        surf_camps: surfCampsWithAvailability
      }
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error fetching surf camps:', error)
    
    // Check if it's a network/DNS error
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    const isNetworkError = errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
                          errorMessage.includes('getaddrinfo') ||
                          errorMessage.includes('ENOTFOUND') ||
                          errorMessage.includes('fetch failed')
    
    return NextResponse.json({
      success: false,
      error: isNetworkError 
        ? 'Unable to connect to database. Please check your Supabase configuration.'
        : errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          message: errorMessage,
          type: isNetworkError ? 'network_error' : 'unknown_error'
        }
      })
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// POST /api/surf-camps - Create a new surf camp
export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const body = await request.json()
    const {
      name,
      description,
      start_date,
      end_date,
      max_participants,
      price,
      level,
      includes,
      images,
      is_active,
      tax_category_id
    } = body

    // Validate required fields
    if (!name || !start_date || !end_date || max_participants === undefined || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, start_date, end_date, max_participants, price' },
        { status: 400 }
      )
    }

    // Validate dates - end_date must be after start_date
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Dates must be valid ISO date strings (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, error: 'end_date must be after start_date' },
        { status: 400 }
      )
    }

    // Normalize dates to YYYY-MM-DD format
    const normalizedStartDate = startDate.toISOString().split('T')[0]
    const normalizedEndDate = endDate.toISOString().split('T')[0]

    // Normalize level field - database expects lowercase
    const normalizedLevel = level ? level.toLowerCase().replace(/\s+/g, '-') : 'all'
    const finalLevel = ['beginner', 'intermediate', 'advanced', 'all'].includes(normalizedLevel) 
      ? normalizedLevel 
      : 'all'

    // Insert new surf camp using admin client
    const { data: newCamp, error } = await supabaseAdmin
      .from('surf_camps')
      .insert({
        name,
        description: description || '',
        start_date: normalizedStartDate,
        end_date: normalizedEndDate,
        max_participants,
        price,
        level: finalLevel,
        includes: includes || [],
        images: images || [],
        is_active: is_active !== undefined ? is_active : true,
        ...(tax_category_id ? { tax_category_id } : {})
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating surf camp:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create surf camp', details: error },
        { status: 500 }
      )
    }

    if (!newCamp) {
      return NextResponse.json(
        { success: false, error: 'No data returned from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        surf_camp: newCamp
      }
    })
  } catch (error) {
    console.error('Error creating surf camp:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
