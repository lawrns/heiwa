// Homepage Sections API
// CRUD operations for homepage content sections

import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/admin-auth'
import { 
  validateCreateHomepageSection, 
  validateUpdateHomepageSection,
  validateSearchParams,
  handleValidationError,
  HomepageSection,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/homepage - Get all homepage sections or specific section
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sectionType = searchParams.get('section_type')
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
      .from('homepage_sections')
      .select('*', { count: 'exact' })

    // Apply filters
    if (sectionType) {
      query = query.eq('section_type', sectionType)
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
      console.error('Error fetching homepage sections:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch homepage sections',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<HomepageSection> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Homepage sections GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/homepage - Create new homepage section
export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()

    // Validate request body
    const validation = validateCreateHomepageSection(body)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_sections')
      .insert([validation.data])
      .select()
      .single()

    if (error) {
      console.error('Error creating homepage section:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create homepage section',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<HomepageSection> = {
      data,
      message: 'Homepage section created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Homepage sections POST error:', error)
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

// PUT /api/cms/homepage - Update homepage section
export async function PUT(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

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
    const validation = validateUpdateHomepageSection(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabaseAdmin
      .from('homepage_sections')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'Homepage section not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating homepage section:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update homepage section',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<HomepageSection> = {
      data,
      message: 'Homepage section updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Homepage sections PUT error:', error)
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

// DELETE /api/cms/homepage - Delete homepage section
export async function DELETE(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

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

    const { error } = await supabaseAdmin
      .from('homepage_sections')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting homepage section:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete homepage section',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Homepage section deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Homepage sections DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
