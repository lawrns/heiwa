import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'
import { executeWithTimeout } from '@/lib/supabase-timeout'
import { requireAdminAuth } from '@/lib/admin-auth'
import { withErrorHandler } from '@/lib/error-handler'
import { validateCSRFToken } from '@/lib/csrf'
import type {
  HomepageSection
} from '@/lib/types/admin-api'

// Database row type for homepage_content table
interface HomepageContentRow {
  id: string
  section: string
  title: string
  subtitle?: string
  description?: string
  content?: string
  image_url?: string
  video_url?: string
  video_id?: string
  link_url?: string
  link_text?: string
  is_active: boolean
  order_index: number
  cards?: string | null
  booking_data?: string | null
  testimonials?: string | null
  facilities?: string | null
  google_rating?: string | null
  blog_config?: string | null
}

// GET - Fetch all homepage sections
export async function GET(request: NextRequest) {
  try {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    console.log('🏠 Homepage API - Starting GET request')
    
    // Fetch homepage content with timeout protection
    console.log('🔗 Fetching homepage content...')
    
    const homepageQuery = supabaseAdmin
      .from('homepage_content')
      .select('*')
      .order('order_index', { ascending: true })
    
    const { data, error } = await executeWithTimeout<HomepageContentRow[]>(
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
    const parsedData = (data || []).map((item: HomepageContentRow): HomepageSection => {
      try {
        return {
          id: item.id,
          section: item.section,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          content: item.content,
          imageUrl: item.image_url,
          videoUrl: item.video_url,
          videoId: item.video_id,
          linkUrl: item.link_url,
          linkText: item.link_text,
          isActive: item.is_active,
          order: item.order_index,
          cards: item.cards ? JSON.parse(item.cards) : undefined,
          bookingData: item.booking_data ? JSON.parse(item.booking_data) : undefined,
          testimonials: item.testimonials ? JSON.parse(item.testimonials) : undefined,
          facilities: item.facilities ? JSON.parse(item.facilities) : undefined,
          googleRating: item.google_rating ? JSON.parse(item.google_rating) : undefined,
          blogConfig: item.blog_config ? JSON.parse(item.blog_config) : undefined
        }
      } catch (parseError) {
        console.error(`❌ JSON parse error for item ${item.id}:`, parseError)
        // Return minimal valid HomepageSection if parsing fails
        return {
          id: item.id,
          section: item.section,
          title: item.title,
          isActive: item.is_active,
          order: item.order_index
        }
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
  // CSRF validation for state-changing operations
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Invalid CSRF token', code: 'CSRF_TOKEN_INVALID' },
      { status: 403 }
    )
  }

  return withErrorHandler(async () => {
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
      .from('homepage_content')
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
      })
      .select()

    if (error) throw error

    // Revalidate homepage to reflect changes immediately
    revalidatePath('/')
    revalidatePath('/admin/homepage')

    return NextResponse.json({
      success: true,
      data: data?.[0]
    })
  })(request)
}

// PUT - Update homepage section
export async function PUT(request: NextRequest) {
  // CSRF validation for state-changing operations
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Invalid CSRF token', code: 'CSRF_TOKEN_INVALID' },
      { status: 403 }
    )
  }

  return withErrorHandler(async () => {
    const authError = requireAdminAuth(request)
    if (authError) return authError

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
        error: 'Section ID is required'
      }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (section !== undefined) updateData.section = section
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (content !== undefined) updateData.content = content
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (videoUrl !== undefined) updateData.video_url = videoUrl
    if (videoId !== undefined) updateData.video_id = videoId
    if (linkUrl !== undefined) updateData.link_url = linkUrl
    if (linkText !== undefined) updateData.link_text = linkText
    if (isActive !== undefined) updateData.is_active = isActive
    if (order !== undefined) updateData.order_index = order
    if (cards !== undefined) updateData.cards = cards ? JSON.stringify(cards) : null
    if (bookingData !== undefined) updateData.booking_data = bookingData ? JSON.stringify(bookingData) : null
    if (testimonials !== undefined) updateData.testimonials = testimonials ? JSON.stringify(testimonials) : null
    if (facilities !== undefined) updateData.facilities = facilities ? JSON.stringify(facilities) : null
    if (googleRating !== undefined) updateData.google_rating = googleRating ? JSON.stringify(googleRating) : null
    if (blogConfig !== undefined) updateData.blog_config = blogConfig ? JSON.stringify(blogConfig) : null

    const { data, error } = await supabaseAdmin
      .from('homepage_content')
      .update(updateData)
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
  })(request)
}

// DELETE - Delete homepage section
export async function DELETE(request: NextRequest) {
  // CSRF validation for state-changing operations
  if (!validateCSRFToken(request)) {
    return NextResponse.json(
      { success: false, error: 'Invalid CSRF token', code: 'CSRF_TOKEN_INVALID' },
      { status: 403 }
    )
  }

  return withErrorHandler(async () => {
    const authError = requireAdminAuth(request)
    if (authError) return authError

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Section ID is required'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('homepage_content')
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
  })(request)
}
