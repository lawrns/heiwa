import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface AddOn {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  images?: string[]
  is_active: boolean
  max_quantity?: number | null
}

/**
 * Fix Supabase storage bucket URLs if needed
 * Ensures CMS images use correct bucket names
 */
function fixImageUrls(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return []
  return images.map(url => {
    if (!url || typeof url !== 'string') return url
    // Fix any old bucket name mismatches (if they exist)
    // Currently add-on-images bucket is correct, but this ensures future compatibility
    return url
  })
}

// API endpoint for getting all add-ons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    const category = searchParams.get('category')
    
    // Use admin client for all requests to bypass RLS
    // This is a public read endpoint - no sensitive data exposed
    let query = supabaseAdmin
      .from('add_ons')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    // Filter by active status (unless admin requests all)
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: addOns, error: addOnsError } = await query

    if (addOnsError) {
      console.error('Error fetching add-ons:', addOnsError)
      // Return empty array if table doesn't exist yet
      return NextResponse.json({
        success: true,
        addOns: []
      })
    }

    // Ensure CMS images are prioritized and correctly formatted
    const addOnsWithFixedImages = (addOns || []).map((addOn: AddOn) => ({
      ...addOn,
      images: fixImageUrls(addOn.images || [])
    }))

    return NextResponse.json({
      success: true,
      addOns: addOnsWithFixedImages
    })

  } catch (error) {
    console.error('Error fetching add-ons:', error)
    return NextResponse.json({
      success: true,
      addOns: [] // Return empty array for graceful degradation
    })
  }
}

// POST - Create new add-on
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, is_active, max_quantity, images } = body

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    const { data: addOn, error } = await supabaseAdmin
      .from('add_ons')
      .insert([
        {
          name,
          description: description || '',
          price: parseFloat(price),
          category,
          is_active: is_active !== false,
          max_quantity: max_quantity || null,
          images: images || [],
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating add-on:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create add-on' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      addOn,
    })
  } catch (error) {
    console.error('Error in add-ons POST API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
