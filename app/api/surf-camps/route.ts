import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    
    // Build query 
    let query = supabase
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
    
    const { data: surfCamps, error: surfCampsError } = await query

    if (surfCampsError) {
      console.error('Error fetching surf camps:', surfCampsError)
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

    // Get enrollment counts for each surf camp
    const surfCampsWithAvailability = await Promise.all(
      (surfCamps || []).map(async (camp: SurfCamp) => {
        const { count: enrolledCount } = await supabase
          .from('surf_camp_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('surf_camp_id', camp.id)
          .eq('status', 'confirmed')
        
        // Handle both old schema (max_participants) and new schema (total_spots)
        const totalSpots = (camp as any).total_spots || camp.max_participants || 18
        const dbAvailableSpots = (camp as any).available_spots
        const calculatedAvailableSpots = totalSpots - (enrolledCount || 0)
        const availableSpots = dbAvailableSpots !== undefined ? dbAvailableSpots : calculatedAvailableSpots
        
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
          images: camp.images || [],
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
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
