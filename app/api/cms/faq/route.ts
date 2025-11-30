// FAQ Items API
// CRUD operations for FAQ items management

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateCreateFAQItem, 
  validateUpdateFAQItem,
  validateFAQSearchParams,
  handleValidationError,
  FAQItem,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCodes,
  ValidationError
} from '@/lib/cms-validators'

// GET /api/cms/faq - Get all FAQ items or specific FAQs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageSlug = searchParams.get('page_slug')
    const category = searchParams.get('category')
    const isActive = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sort_by') || 'order_index'
    const sortOrder = searchParams.get('sort_order') || 'asc'

    // Validate search params
    const paramsValidation = validateFAQSearchParams({
      search: searchParams.get('search') || undefined,
      page_slug: pageSlug as FAQItem['page_slug'] || undefined,
      category: category || undefined,
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder as 'asc' | 'desc'
    })
    if (!paramsValidation.success) {
      handleValidationError(paramsValidation)
    }

    let query = supabase
      .from('faq_items')
      .select('*', { count: 'exact' })

    // Apply filters
    if (pageSlug) {
      query = query.eq('page_slug', pageSlug)
    }
    if (category) {
      query = query.eq('category', category)
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
      console.error('Error fetching FAQ items:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to fetch FAQ items',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSListResponse<FAQItem> = {
      data: data || [],
      count: count || 0
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('FAQ items GET error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// POST /api/cms/faq - Create new FAQ item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = validateCreateFAQItem(body)
    if (!validation.success) {
      handleValidationError(validation)
    }

    // Add created_by if provided (optional)
    const insertData = {
      ...validation.data!,
      created_by: body.created_by || null,
      updated_by: body.created_by || null
    }

    const { data, error } = await supabase
      .from('faq_items')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to create FAQ item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<FAQItem> = {
      data,
      message: 'FAQ item created successfully'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('FAQ items POST error:', error)
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

// PUT /api/cms/faq - Update FAQ item
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
    const validation = validateUpdateFAQItem(updateData)
    if (!validation.success) {
      handleValidationError(validation)
    }

    const { data, error } = await supabase
      .from('faq_items')
      .update(validation.data!)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: CMSErrorCodes.NOT_FOUND,
            message: 'FAQ item not found' 
          },
          { status: 404 }
        )
      }
      console.error('Error updating FAQ item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to update FAQ item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    const response: CMSApiResponse<FAQItem> = {
      data,
      message: 'FAQ item updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('FAQ items PUT error:', error)
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

// DELETE /api/cms/faq - Delete FAQ item
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
      .from('faq_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting FAQ item:', error)
      return NextResponse.json(
        { 
          error: CMSErrorCodes.DATABASE_ERROR,
          message: 'Failed to delete FAQ item',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'FAQ item deleted successfully' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('FAQ items DELETE error:', error)
    return NextResponse.json(
      { 
        error: CMSErrorCodes.UNKNOWN_ERROR,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
