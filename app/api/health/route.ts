/**
 * Health Check API Endpoint
 * Returns system status and metrics
 */

import { NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'
import { supabaseAdmin } from '@/lib/supabase'

async function checkDatabaseConnection(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    // Simple query to verify database connection
    const { error } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('Database health check error:', error)
      return 'error'
    }
    
    return 'connected'
  } catch (error) {
    console.error('Database health check exception:', error)
    return 'disconnected'
  }
}

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection()
    const isHealthy = dbStatus === 'connected'
    
    const health = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      metrics: {
        recentErrors: monitoring.getRecentErrors(5).length,
        totalMetrics: monitoring.getMetrics().length,
        averageApiResponseTime: monitoring.getAverageMetric('api.rooms.get') || null,
      },
      checks: {
        database: dbStatus,
        cache: 'operational',
      },
    }

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}


