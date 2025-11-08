// Testimonials API
// CRUD operations for testimonials management

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateCreateTestimonial, 
  validateUpdateTestimonial,
  validateSearchParams,
  handleValidationError,
  Testimonial,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/testimonials - Get all testimonials or specific testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rating = searchParams.get('rating')
    const verified = searchParams.get('verified')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'order_index'
    const sortOrder = searchParams.get('sort_order') || 'asc'

    // Validate search params
    const paramsValidation = validateSearchParams({
      search: searchParams.get('search') || undefined,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc'
    })
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation)
    }

    let query = supabase
      .from('testimonials')
      .select('*', { count: 'exact' })

    // Apply filters
    if (rating) {
      query = query.eq('rating', parseInt(rating))
    }
    if (verified !== null) {
      query = query.eq('verified', verified === 'true')
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching testimonials:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch testimonials',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<Testimonial> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Testimonials GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateCreateTestimonial(body)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([validation.data!])
      .select()
      .single()

    if (error) {
      console.error('Error creating testimonial:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create testimonial',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<Testimonial> = {
      data,
      message: 'Testimonial created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Testimonials POST error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// PUT /api/cms/testimonials - Update testimonial
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for updates' 
        },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = validateUpdateTestimonial(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update(validation.data!)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'Testimonial not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating testimonial:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update testimonial',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<Testimonial> = {
      data,
      message: 'Testimonial updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Testimonials PUT error:', error)
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: error.message,
          details: (error as ValidationError).details 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// DELETE /api/cms/testimonials - Delete testimonial
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { 
          error: CMSErrorCodes.VALIDATION_ERROR,
          message: 'ID is required for deletion' 
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting testimonial:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete testimonial',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Testimonial deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Testimonials DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
