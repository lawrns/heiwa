/**
 * Monitoring and Error Tracking Utilities
 * Centralized error logging and performance monitoring
 */

interface ErrorContext {
  userId?: string
  requestId?: string
  url?: string
  method?: string
  userAgent?: string
  ip?: string
  [key: string]: any
}

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class MonitoringService {
  private errors: Array<{ error: Error; context: ErrorContext; timestamp: number }> = []
  private metrics: PerformanceMetric[] = []
  private maxErrors = 100 // Keep last 100 errors in memory
  private maxMetrics = 1000 // Keep last 1000 metrics

  /**
   * Log an error with context
   */
  logError(error: Error | string, context: ErrorContext = {}) {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    
    const errorEntry = {
      error: errorObj,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
    }

    this.errors.push(errorEntry)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error logged:', errorObj.message, context)
    }

    // TODO: Send to external error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(errorObj, { extra: context })
  }

  /**
   * Track performance metrics
   */
  trackMetric(name: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration}ms`, metadata)
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10) {
    return this.errors.slice(-limit)
  }

  /**
   * Get performance metrics
   */
  getMetrics(name?: string, limit = 100) {
    const filtered = name
      ? this.metrics.filter(m => m.name === name)
      : this.metrics
    
    return filtered.slice(-limit)
  }

  /**
   * Get average performance for a metric
   */
  getAverageMetric(name: string) {
    const metrics = this.metrics.filter(m => m.name === name)
    if (metrics.length === 0) return null

    const total = metrics.reduce((sum, m) => sum + m.duration, 0)
    return total / metrics.length
  }

  /**
   * Clear all stored data
   */
  clear() {
    this.errors = []
    this.metrics = []
  }
}

// Singleton instance
export const monitoring = new MonitoringService()

/**
 * Performance tracking decorator
 */
export function trackPerformance(name: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = Date.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - start
        monitoring.trackMetric(`${target.constructor.name}.${propertyKey}`, duration)
        return result
      } catch (error) {
        const duration = Date.now() - start
        monitoring.trackMetric(`${target.constructor.name}.${propertyKey}`, duration, { error: true })
        monitoring.logError(error instanceof Error ? error : new Error(String(error)), {
          method: propertyKey,
          className: target.constructor.name,
        })
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Helper to measure async function performance
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    monitoring.trackMetric(name, duration)
    return result
  } catch (error) {
    const duration = Date.now() - start
    monitoring.trackMetric(name, duration, { error: true })
    monitoring.logError(error instanceof Error ? error : new Error(String(error)), {
      operation: name,
    })
    throw error
  }
}


