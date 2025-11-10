// Booking Trends Analytics API
// Real booking trends data

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const brand = searchParams.get('brand')

    // Build query
    let query = supabaseAdmin
      .from('bookings')
      .select('id, created_at, status, payment_status, total_amount')

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching bookings data:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings data' },
        { status: 500 }
      )
    }

    // Group by month and status
    const monthlyTrends: Record<string, { total: number; confirmed: number; pending: number; cancelled: number }> = {}
    const statusCounts = {
      total: bookings?.length || 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0
    }

    bookings?.forEach(booking => {
      const date = new Date(booking.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { total: 0, confirmed: 0, pending: 0, cancelled: 0 }
      }

      monthlyTrends[monthKey].total++
      
      if (booking.status === 'confirmed') {
        monthlyTrends[monthKey].confirmed++
        statusCounts.confirmed++
      } else if (booking.status === 'pending') {
        monthlyTrends[monthKey].pending++
        statusCounts.pending++
      } else if (booking.status === 'cancelled') {
        monthlyTrends[monthKey].cancelled++
        statusCounts.cancelled++
      }
    })

    // Convert to array format for charts
    const chartData = Object.entries(monthlyTrends)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate growth
    const thisMonth = new Date().toISOString().slice(0, 7)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
    
    const thisMonthBookings = monthlyTrends[thisMonth]?.total || 0
    const lastMonthBookings = monthlyTrends[lastMonth]?.total || 0
    const growth = lastMonthBookings > 0 
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        monthlyTrends: chartData,
        growth: parseFloat(growth),
        thisMonthBookings,
        lastMonthBookings
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

