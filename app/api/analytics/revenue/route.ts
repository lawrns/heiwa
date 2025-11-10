// Revenue Analytics API
// Real revenue data from bookings

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const brand = searchParams.get('brand') // Filter by brand if needed

    // Build query for confirmed bookings
    let query = supabaseAdmin
      .from('bookings')
      .select('total_amount, created_at, payment_status, client_ids')
      .eq('payment_status', 'confirmed')

    // Apply date range filter
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching revenue data:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch revenue data' },
        { status: 500 }
      )
    }

    // Group by month
    const monthlyRevenue: Record<string, number> = {}
    const totalRevenue = bookings?.reduce((sum, booking) => {
      const amount = parseFloat(booking.total_amount) || 0
      const date = new Date(booking.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount
      return sum + amount
    }, 0) || 0

    // Convert to array format for charts
    const chartData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate growth
    const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
    
    const thisMonthRevenue = monthlyRevenue[thisMonth] || 0
    const lastMonthRevenue = monthlyRevenue[lastMonth] || 0
    const growth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        monthlyRevenue: chartData,
        growth: parseFloat(growth),
        thisMonthRevenue: parseFloat(thisMonthRevenue.toFixed(2)),
        lastMonthRevenue: parseFloat(lastMonthRevenue.toFixed(2))
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

