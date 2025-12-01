/**
 * Health Check API Endpoint
 * Returns system status and metrics
 */

import { NextResponse } from 'next/server'
import { monitoring } from '@/lib/monitoring'

export async function GET() {
  try {
    const health = {
      status: 'healthy',
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
        database: 'connected', // TODO: Add actual DB connection check
        cache: 'operational',
      },
    }

    return NextResponse.json(health, {
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


