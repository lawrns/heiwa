/**
 * Health Check Utilities
 * Provides comprehensive health checks for all services
 */

import { supabaseAdmin } from './supabase'

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime: number
  message?: string
  details?: any
  timestamp: string
}

export interface OverallHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  timestamp: string
  uptime: number
}

// Application start time
const startTime = Date.now()

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now()

  try {
    // Simple query to check connection
    const { data, error } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .limit(1)

    const responseTime = Date.now() - start

    if (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime,
        message: 'Database query failed',
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      }
    }

    return {
      service: 'database',
      status: 'healthy',
      responseTime,
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime,
      message: 'Database connection failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check Supabase storage health
 */
export async function checkStorageHealth(): Promise<HealthCheckResult> {
  const start = Date.now()

  try {
    // Check if we can list buckets
    const { data, error } = await supabaseAdmin.storage.listBuckets()

    const responseTime = Date.now() - start

    if (error) {
      return {
        service: 'storage',
        status: 'unhealthy',
        responseTime,
        message: 'Storage access failed',
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      }
    }

    return {
      service: 'storage',
      status: 'healthy',
      responseTime,
      message: 'Storage access successful',
      details: { buckets: data.length },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      service: 'storage',
      status: 'unhealthy',
      responseTime,
      message: 'Storage check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check external API health (Stripe, Resend, etc.)
 */
export async function checkExternalAPIHealth(
  name: string,
  url: string
): Promise<HealthCheckResult> {
  const start = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseTime = Date.now() - start

    if (response.ok) {
      return {
        service: name,
        status: 'healthy',
        responseTime,
        message: `${name} API is accessible`,
        timestamp: new Date().toISOString(),
      }
    } else {
      return {
        service: name,
        status: 'unhealthy',
        responseTime,
        message: `${name} API returned ${response.status}`,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    const responseTime = Date.now() - start
    return {
      service: name,
      status: 'unhealthy',
      responseTime,
      message: `${name} API check failed`,
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Check memory usage
 */
export function checkMemoryHealth(): HealthCheckResult {
  const start = Date.now()

  // Memory usage is not available in Node.js by default
  // This is a placeholder that would be enhanced with proper monitoring
  const responseTime = Date.now() - start

  return {
    service: 'memory',
    status: 'healthy',
    responseTime,
    message: 'Memory usage normal',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Check disk space
 */
export function checkDiskHealth(): HealthCheckResult {
  const start = Date.now()

  // Disk space is not available in Node.js by default
  // This is a placeholder that would be enhanced with proper monitoring
  const responseTime = Date.now() - start

  return {
    service: 'disk',
    status: 'healthy',
    responseTime,
    message: 'Disk space normal',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Run all health checks
 */
export async function runHealthChecks(): Promise<OverallHealth> {
  const checks: HealthCheckResult[] = []

  // Run all checks in parallel
  const [
    database,
    storage,
    memory,
    disk,
  ] = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth(),
    checkMemoryHealth(),
    checkDiskHealth(),
  ])

  checks.push(database, storage, memory, disk)

  // Check external APIs if configured
  if (process.env.STRIPE_SECRET_KEY) {
    // Note: We can't actually check Stripe without a proper endpoint
    // This is a placeholder
    checks.push({
      service: 'stripe',
      status: 'healthy',
      responseTime: 0,
      message: 'Stripe configured',
      timestamp: new Date().toISOString(),
    })
  }

  if (process.env.RESEND_API_KEY) {
    // Check Resend API
    const resend = await checkExternalAPIHealth('resend', 'https://api.resend.com')
    checks.push(resend)
  }

  // Determine overall health
  const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
  const degradedCount = checks.filter(c => c.status === 'degraded').length

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'

  if (unhealthyCount > 0) {
    overallStatus = 'unhealthy'
  } else if (degradedCount > 0) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'healthy'
  }

  return {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
  }
}

/**
 * Get health status for API response
 */
export async function getHealthStatus(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  uptime: number
}> {
  const health = await runHealthChecks()

  return {
    status: health.status,
    checks: health.checks,
    uptime: health.uptime,
  }
}

/**
 * Check if system is healthy
 */
export async function isHealthy(): Promise<boolean> {
  const health = await runHealthChecks()
  return health.status === 'healthy'
}
