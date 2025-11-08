// CTA Buttons API
// CRUD operations for call-to-action buttons management

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateCreateCTAButton, 
  validateUpdateCTAButton,
  validateSearchParams,
  handleValidationError,
  CTAButton,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/cta - Get all CTA buttons or specific CTA buttons
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const style = searchParams.get('style')
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
      .from('cta_buttons')
      .select('*', { count: 'exact' })

    // Apply filters
    if (location) {
      query = query.eq('location', location)
    }
    if (style) {
      query = query.eq('style', style)
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
      console.error('Error fetching CTA buttons:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch CTA buttons',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<CTAButton> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('CTA buttons GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/cta - Create new CTA button
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateCreateCTAButton(body)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('cta_buttons')
      .insert([validation.data!])
      .select()
      .single()

    if (error) {
      console.error('Error creating CTA button:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create CTA button',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<CTAButton> = {
      data,
      message: 'CTA button created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('CTA buttons POST error:', error)
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

// PUT /api/cms/cta - Update CTA button
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
    const validation = validateUpdateCTAButton(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('cta_buttons')
      .update(validation.data!)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'CTA button not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating CTA button:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update CTA button',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<CTAButton> = {
      data,
      message: 'CTA button updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('CTA buttons PUT error:', error)
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

// DELETE /api/cms/cta - Delete CTA button
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
      .from('cta_buttons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting CTA button:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete CTA button',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'CTA button deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('CTA buttons DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
