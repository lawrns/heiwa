/**
 * Advanced Error Monitoring and Logging System
 * Provides comprehensive error tracking, performance monitoring, and alerting
 */

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  environment?: string;
  version?: string;
  additionalData?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, any>;
}

interface AlertConfig {
  errorThreshold: number; // Errors per minute
  performanceThreshold: number; // Response time in ms
  emailRecipients: string[];
  webhookUrl?: string;
}

class MonitoringService {
  private errorCount = new Map<string, number>();
  private performanceMetrics: PerformanceMetric[] = [];
  private alertConfig: AlertConfig;
  private lastAlertTime = new Map<string, number>();

  constructor(config: AlertConfig) {
    this.alertConfig = config;
    
    // Clean up old metrics every 5 minutes
    setInterval(() => this.cleanupMetrics(), 5 * 60 * 1000);
  }

  /**
   * Log an error with context
   */
  async logError(error: Error | string, context: ErrorContext = {}): Promise<void> {
    const errorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      name: typeof error === 'object' ? error.name : 'Error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      ...context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorData);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      await this.sendToExternalService('error', errorData);
    }

    // Track error frequency for alerting
    const errorKey = `${errorData.name}:${errorData.message}`;
    const currentCount = this.errorCount.get(errorKey) || 0;
    this.errorCount.set(errorKey, currentCount + 1);

    // Check if alert threshold is reached
    await this.checkErrorThreshold(errorKey, currentCount + 1);
  }

  /**
   * Log performance metrics
   */
  async logPerformance(metric: Omit<PerformanceMetric, 'timestamp'>): Promise<void> {
    const performanceData: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(performanceData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${metric.name} = ${metric.value}${metric.unit}`);
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      await this.sendToExternalService('performance', performanceData);
    }

    // Check performance thresholds
    if (metric.unit === 'ms' && metric.value > this.alertConfig.performanceThreshold) {
      await this.sendAlert('performance', `Slow response detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  /**
   * Log API request/response
   */
  async logApiCall(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    context: Record<string, any> = {}
  ): Promise<void> {
    const apiData = {
      method,
      url,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const status = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
      console.log(`${status} API: ${method} ${url} - ${statusCode} (${responseTime}ms)`);
    }

    // Send to external service
    await this.sendToExternalService('api', apiData);

    // Log as performance metric
    await this.logPerformance({
      name: `api_${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`,
      value: responseTime,
      unit: 'ms',
      context: { statusCode, method, url }
    });

    // Log errors for 4xx/5xx responses
    if (statusCode >= 400) {
      await this.logError(`API Error: ${method} ${url} returned ${statusCode}`, {
        url,
        additionalData: { method, statusCode, responseTime, ...context }
      });
    }
  }

  /**
   * Send data to external monitoring service
   */
  private async sendToExternalService(type: string, data: any): Promise<void> {
    try {
      // In a real implementation, this would send to services like:
      // - Sentry for error tracking
      // - DataDog for metrics
      // - LogRocket for session replay
      // - Custom webhook endpoints

      if (process.env.MONITORING_WEBHOOK_URL) {
        await fetch(process.env.MONITORING_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY || ''}`
          },
          body: JSON.stringify({
            type,
            data,
            service: 'heiwa-booking-widget',
            timestamp: new Date().toISOString()
          })
        });
      }
    } catch (error) {
      // Don't let monitoring errors break the application
      console.error('Failed to send monitoring data:', error);
    }
  }

  /**
   * Check if error threshold is exceeded and send alert
   */
  private async checkErrorThreshold(errorKey: string, count: number): Promise<void> {
    if (count >= this.alertConfig.errorThreshold) {
      const lastAlert = this.lastAlertTime.get(errorKey) || 0;
      const now = Date.now();
      
      // Only send alert once per hour for the same error
      if (now - lastAlert > 60 * 60 * 1000) {
        await this.sendAlert('error', `Error threshold exceeded: ${errorKey} occurred ${count} times`);
        this.lastAlertTime.set(errorKey, now);
      }
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlert(type: string, message: string): Promise<void> {
    try {
      const alertData = {
        type,
        message,
        timestamp: new Date().toISOString(),
        service: 'heiwa-booking-widget',
        environment: process.env.NODE_ENV
      };

      // Send webhook alert
      if (this.alertConfig.webhookUrl) {
        await fetch(this.alertConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alertData)
        });
      }

      // In production, you would also send email alerts here
      console.warn(`🚨 ALERT: ${type.toUpperCase()} - ${message}`);
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    
    // Clean performance metrics
    this.performanceMetrics = this.performanceMetrics.filter(
      metric => new Date(metric.timestamp).getTime() > oneHourAgo
    );

    // Reset error counts every hour
    this.errorCount.clear();
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    errorCount: number;
    performanceMetrics: number;
    averageResponseTime: number;
  } {
    const recentMetrics = this.performanceMetrics.filter(
      m => m.unit === 'ms' && Date.now() - new Date(m.timestamp).getTime() < 15 * 60 * 1000
    );

    const averageResponseTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
      : 0;

    return {
      errorCount: Array.from(this.errorCount.values()).reduce((sum, count) => sum + count, 0),
      performanceMetrics: this.performanceMetrics.length,
      averageResponseTime: Math.round(averageResponseTime)
    };
  }
}

// Create monitoring instance with configuration
export const monitoring = new MonitoringService({
  errorThreshold: 10, // 10 errors per minute
  performanceThreshold: 5000, // 5 seconds
  emailRecipients: ['admin@heiwahouse.com'],
  webhookUrl: process.env.MONITORING_WEBHOOK_URL
});

/**
 * Middleware for automatic API monitoring
 */
export async function withMonitoring<T>(
  operation: () => Promise<T>,
  context: { name: string; method?: string; url?: string }
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const responseTime = Date.now() - startTime;
    
    await monitoring.logPerformance({
      name: context.name,
      value: responseTime,
      unit: 'ms',
      context
    });
    
    return result;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    await monitoring.logError(error as Error, {
      url: context.url,
      additionalData: { ...context, responseTime }
    });
    
    throw error;
  }
}

export default monitoring;
