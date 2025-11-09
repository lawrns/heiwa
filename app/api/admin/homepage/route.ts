import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export interface HomepageSection {
  id: string
  section: string
  title: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  videoId?: string
  linkUrl?: string
  linkText?: string
  isActive: boolean
  order: number
  
  // Complex content fields for different section types
  cards?: CardData[]
  bookingData?: BookingData[]
  testimonials?: TestimonialData[]
  facilities?: FacilityData[]
  googleRating?: GoogleRatingData
}

export interface CardData {
  id?: string
  title: string
  description: string
  image?: string
  images?: string[]
  link?: string
  mediaType?: 'image' | 'video'
  mediaUrl?: string
}

export interface BookingData {
  id?: string
  dates: string
  price: string
  availableSpots: string
  totalSpots?: number
}

export interface TestimonialData {
  id?: string
  name: string
  rating: number
  text: string
  timeAgo: string
  verified: boolean
}

export interface FacilityData {
  id?: string
  title: string
  description: string
  mediaType: 'image' | 'video'
  mediaUrl: string
}

export interface GoogleRatingData {
  rating: number
  totalReviews: number
  url: string
}

// GET - Fetch all homepage sections
export async function GET() {
  try {
    console.log('🏠 Homepage API - Starting GET request')
    
    // Test Supabase connection
    console.log('🔗 Testing Supabase connection...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('homepage_content' as any)
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Supabase connection test failed:', testError)
      throw new Error(`Supabase connection failed: ${testError.message}`)
    }
    
    console.log('✅ Supabase connection successful, fetching data...')
    
    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('❌ Database query error:', error)
      throw error
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} homepage sections`)

    // Parse JSON fields for complex data types
    const parsedData = (data || []).map((item: any) => {
      try {
        return {
          ...item,
          cards: item.cards ? JSON.parse(item.cards) : undefined,
          bookingData: item.booking_data ? JSON.parse(item.booking_data) : undefined,
          testimonials: item.testimonials ? JSON.parse(item.testimonials) : undefined,
          facilities: item.facilities ? JSON.parse(item.facilities) : undefined,
          googleRating: item.google_rating ? JSON.parse(item.google_rating) : undefined,
          videoId: item.video_id || undefined
        }
      } catch (parseError) {
        console.error(`❌ JSON parse error for item ${item.id}:`, parseError)
        return item // Return original item if parsing fails
      }
    })

    console.log('✅ Successfully parsed all homepage data')

    return NextResponse.json({
      success: true,
      data: parsedData
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (err) {
    console.error('❌ Homepage API Error:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch homepage content',
      debug: process.env.NODE_ENV === 'development' ? {
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      } : undefined
    }, { status: 500 })
  }
}

// POST - Create new homepage section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      section, 
      title, 
      subtitle, 
      description, 
      content, 
      imageUrl, 
      videoUrl, 
      videoId,
      linkUrl, 
      linkText, 
      isActive, 
      order,
      cards,
      bookingData,
      testimonials,
      facilities,
      googleRating
    } = body

    if (!section || !title) {
      return NextResponse.json({
        success: false,
        error: 'Section and title are required'
      }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .insert({
        section,
        title,
        subtitle,
        description,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
        video_id: videoId,
        link_url: linkUrl,
        link_text: linkText,
        cards: cards ? JSON.stringify(cards) : null,
        booking_data: bookingData ? JSON.stringify(bookingData) : null,
        testimonials: testimonials ? JSON.stringify(testimonials) : null,
        facilities: facilities ? JSON.stringify(facilities) : null,
        google_rating: googleRating ? JSON.stringify(googleRating) : null,
        is_active: isActive ?? true,
        order_index: order ?? 0
      } as any)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (err) {
    console.error('Error creating homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to create homepage section'
    }, { status: 500 })
  }
}

// PUT - Update homepage section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id, 
      section, 
      title, 
      subtitle, 
      description, 
      content, 
      imageUrl, 
      videoUrl, 
      videoId,
      linkUrl, 
      linkText, 
      isActive, 
      order,
      cards,
      bookingData,
      testimonials,
      facilities,
      googleRating
    } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }

    const updateData: any = {
      section,
      title,
      subtitle,
      description,
      content,
      image_url: imageUrl,
      video_url: videoUrl,
      video_id: videoId,
      link_url: linkUrl,
      link_text: linkText,
      is_active: isActive,
      order_index: order,
      updated_at: new Date().toISOString()
    }

    // Only include JSON fields if they're provided
    if (cards !== undefined) {
      updateData.cards = cards ? JSON.stringify(cards) : null
    }
    if (bookingData !== undefined) {
      updateData.booking_data = bookingData ? JSON.stringify(bookingData) : null
    }
    if (testimonials !== undefined) {
      updateData.testimonials = testimonials ? JSON.stringify(testimonials) : null
    }
    if (facilities !== undefined) {
      updateData.facilities = facilities ? JSON.stringify(facilities) : null
    }
    if (googleRating !== undefined) {
      updateData.google_rating = googleRating ? JSON.stringify(googleRating) : null
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .update(updateData as any)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (err) {
    console.error('Error updating homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to update homepage section'
    }, { status: 500 })
  }
}

// DELETE - Delete homepage section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('homepage_content' as any)
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    })
  } catch (err) {
    console.error('Error deleting homepage section:', err)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete homepage section'
    }, { status: 500 })
  }
}
