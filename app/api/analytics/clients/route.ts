// Client Analytics API
// Real client growth metrics

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
      .from('clients')
      .select('id, created_at, brand')

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    if (brand) {
      query = query.eq('brand', brand)
    }

    const { data: clients, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching clients data:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch clients data' },
        { status: 500 }
      )
    }

    // Group by month
    const monthlyGrowth: Record<string, number> = {}
    const totalClients = clients?.length || 0

    clients?.forEach(client => {
      const date = new Date(client.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyGrowth[monthKey] = (monthlyGrowth[monthKey] || 0) + 1
    })

    // Convert to array format for charts
    const chartData = Object.entries(monthlyGrowth)
      .map(([month, count]) => ({
        month,
        count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Calculate growth
    const thisMonth = new Date().toISOString().slice(0, 7)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
    
    const thisMonthClients = monthlyGrowth[thisMonth] || 0
    const lastMonthClients = monthlyGrowth[lastMonth] || 0
    const growth = lastMonthClients > 0 
      ? ((thisMonthClients - lastMonthClients) / lastMonthClients * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      success: true,
      data: {
        totalClients,
        monthlyGrowth: chartData,
        growth: parseFloat(growth),
        thisMonthClients,
        lastMonthClients
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

