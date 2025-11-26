import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { executeWithTimeout } from '@/lib/supabase-timeout'

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
  blogConfig?: BlogConfigData
}

export interface BlogConfigData {
  limit?: number
  showCategory?: boolean
  showDate?: boolean
  showReadingTime?: boolean
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
    
    // Fetch homepage content with timeout protection
    console.log('🔗 Fetching homepage content...')
    
    const homepageQuery = supabaseAdmin
      .from('homepage_content' as any)
      .select('*')
      .order('order_index', { ascending: true })
    
    const { data, error } = await executeWithTimeout(
      homepageQuery,
      1000 // 1 second timeout for fast failure
    )
    
    if (error) {
      console.error('❌ Supabase connection failed:', error)
      
      // Check if it's a timeout/network error - return empty array gracefully
      const errorMessage = error?.message || String(error)
      const isNetworkError = errorMessage.includes('timeout') ||
                            errorMessage.includes('NETWORK_ERROR') ||
                            errorMessage.includes('TIMEOUT') ||
                            errorMessage.includes('Supabase may be unreachable')
      
      if (isNetworkError) {
        console.warn('⚠️ Supabase unreachable - returning empty homepage content')
        return NextResponse.json({
          success: true,
          data: []
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
      
      throw new Error(`Supabase connection failed: ${error.message}`)
    }
    
    // Handle null data (connection failure)
    if (!data) {
      console.warn('⚠️ No homepage data returned - returning empty array')
      return NextResponse.json({
        success: true,
        data: []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

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
          blogConfig: item.blog_config ? JSON.parse(item.blog_config) : undefined,
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
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    const isNetworkError = errorMessage.includes('ERR_NAME_NOT_RESOLVED') || 
                          errorMessage.includes('getaddrinfo') ||
                          errorMessage.includes('ENOTFOUND') ||
                          errorMessage.includes('fetch failed') ||
                          errorMessage.includes('Supabase connection failed')
    
    console.error('❌ Homepage API Error:', {
      error: err,
      message: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
      isNetworkError
    })
    
    return NextResponse.json({
      success: false,
      error: isNetworkError 
        ? 'Unable to connect to database. Please verify your Supabase project is active and environment variables are configured correctly.'
        : 'Failed to fetch homepage content',
      debug: process.env.NODE_ENV === 'development' ? {
        message: errorMessage,
        type: isNetworkError ? 'network_error' : 'unknown_error',
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
      googleRating,
      blogConfig
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
        blog_config: blogConfig ? JSON.stringify(blogConfig) : null,
        is_active: isActive ?? true,
        order_index: order ?? 0
      } as any)
      .select()

    if (error) throw error

    // Revalidate homepage to reflect changes immediately
    revalidatePath('/')
    revalidatePath('/admin/homepage')

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
      googleRating,
      blogConfig
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
    if (blogConfig !== undefined) {
      updateData.blog_config = blogConfig ? JSON.stringify(blogConfig) : null
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_content' as any)
      .update(updateData as any)
      .eq('id', id)
      .select()

    if (error) throw error

    // Revalidate homepage to reflect changes immediately
    revalidatePath('/')
    revalidatePath('/admin/homepage')

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  } catch (err) {
    console.error('Error updating homepage section:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Detailed error:', {
      error: err,
      message: errorMessage,
      stack: err instanceof Error ? err.stack : undefined
    })
    return NextResponse.json({
      success: false,
      error: `Failed to update homepage section: ${errorMessage}`
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

    // Revalidate homepage to reflect changes immediately
    revalidatePath('/')
    revalidatePath('/admin/homepage')

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
