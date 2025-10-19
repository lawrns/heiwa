/**
 * Centralized logging utility for Heiwa House
 * Provides structured logging with different log levels
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`
    
    if (context && Object.keys(context).length > 0) {
      formatted += ` | Context: ${JSON.stringify(context)}`
    }
    
    return formatted
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    // Always log in development
    if (this.isDevelopment) {
      const formatted = this.formatMessage(entry)
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted, error || '')
          break
        case LogLevel.INFO:
          console.info(formatted, error || '')
          break
        case LogLevel.WARN:
          console.warn(formatted, error || '')
          break
        case LogLevel.ERROR:
          console.error(formatted, error || '')
          if (error?.stack) {
            console.error('Stack trace:', error.stack)
          }
          break
      }
    }

    // In production, send to external logging service
    if (this.isProduction && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      this.sendToExternalService(entry)
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // TODO: Integrate with logging service (e.g., Sentry, LogRocket, Datadog)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(entry.error || new Error(entry.message), {
    //     level: entry.level,
    //     extra: entry.context,
    //   })
    // }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.WARN, message, context, error)
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  // Specific helpers for common scenarios
  apiError(endpoint: string, error: Error, context?: Record<string, any>) {
    this.error(`API Error: ${endpoint}`, error, {
      ...context,
      endpoint,
      errorMessage: error.message,
    })
  }

  bookingError(step: string, error: Error, context?: Record<string, any>) {
    this.error(`Booking Flow Error: ${step}`, error, {
      ...context,
      step,
    })
  }

  dataFetchError(resource: string, error: Error, context?: Record<string, any>) {
    this.error(`Data Fetch Error: ${resource}`, error, {
      ...context,
      resource,
    })
  }

  validationError(field: string, message: string, context?: Record<string, any>) {
    this.warn(`Validation Error: ${field}`, {
      ...context,
      field,
      validationMessage: message,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export default for convenience
export default logger

