import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all tax categories
export async function GET() {
  try {
    const { data: taxCategories, error } = await supabaseAdmin
      .from('tax_categories')
      .select('*')
      .order('rate', { ascending: true })

    if (error) {
      console.error('Error fetching tax categories:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tax categories'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taxCategories: taxCategories || []
    })
  } catch (error) {
    console.error('Error in tax-categories GET API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// POST - Create a new tax category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, rate, description, is_default } = body

    if (!name || rate === undefined || rate === null) {
      return NextResponse.json({
        success: false,
        error: 'Name and rate are required'
      }, { status: 400 })
    }

    // Validate rate is between 0 and 1
    const rateNum = parseFloat(rate)
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 1) {
      return NextResponse.json({
        success: false,
        error: 'Rate must be a decimal between 0 and 1 (e.g., 0.23 for 23%)'
      }, { status: 400 })
    }

    // If this is being set as default, unset existing default first
    if (is_default) {
      await supabaseAdmin
        .from('tax_categories')
        .update({ is_default: false })
        .eq('is_default', true)
    }

    const { data: taxCategory, error } = await supabaseAdmin
      .from('tax_categories')
      .insert([{
        name,
        rate: rateNum,
        description: description || null,
        is_default: is_default || false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating tax category:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create tax category'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      taxCategory
    })
  } catch (error) {
    console.error('Error in tax-categories POST API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
