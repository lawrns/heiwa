import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { executeWithTimeout } from '@/lib/supabase-timeout'
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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const showAll = searchParams.get('admin') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    
    // Build query with timeout protection
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
    
    // Execute with timeout to prevent long waits
    const queryPromise = query as any
    const { data: surfCamps, error: surfCampsError } = await executeWithTimeout(
      queryPromise,
      3000 // 3 second timeout for fast failure
    )

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
      
      // Check if it's a timeout/network error - return empty array gracefully
      const errorMessage = surfCampsError?.message || String(surfCampsError)
      const isNetworkError = errorMessage.includes('timeout') ||
                            errorMessage.includes('NETWORK_ERROR') ||
                            errorMessage.includes('TIMEOUT') ||
                            errorMessage.includes('Supabase may be unreachable')
      
      // Return empty array instead of error to prevent site breakage
      if (isNetworkError) {
        console.warn('⚠️ Supabase unreachable - returning empty surf camps list')
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
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch surf camps'
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

    // Get enrollment counts for each surf camp (with timeout protection)
    const surfCampsWithAvailability = await Promise.all(
      (surfCamps || []).map(async (camp: SurfCamp) => {
        const enrollmentQuery = supabaseAdmin
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .eq('status', 'confirmed')
        
        const enrollmentResult = await executeWithTimeout(
          enrollmentQuery as any,
          500 // 500ms timeout for enrollment count
        )
        const { error } = enrollmentResult
        const enrolledCount = (enrollmentResult as any).count || 0
        
        // Use max_participants as the primary source, fall back to total_spots for legacy data
        const totalSpots = camp.max_participants || (camp as any).total_spots || 18
        const calculatedAvailableSpots = totalSpots - (enrolledCount || 0)
        const availableSpots = Math.max(0, calculatedAvailableSpots)
        
        if (error) {
          console.warn(`Error fetching enrollment count for camp ${camp.id}:`, error)
        }
        
        // Cast enrolledCount to number since it might be undefined
        const enrolledCountNum = typeof enrolledCount === 'number' ? enrolledCount : 0
        
        return {
          id: camp.id,
          name: camp.name,
          description: camp.description,
          start_date: camp.start_date,
          end_date: camp.end_date,
          price: camp.price,
          max_participants: totalSpots,
          total_spots: totalSpots,
          available_spots: Math.max(0, availableSpots),
          enrolled_count: enrolledCount || 0,
          is_full: availableSpots <= 0,
          level: camp.level || 'all',
          images: fixImageUrls(camp.images || []),
          includes: camp.includes || []
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
      is_active
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
        is_active: is_active !== undefined ? is_active : true
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
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
