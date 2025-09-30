'use client'

import React from 'react'
import type { ApiErrorBoundaryState } from '@/lib/types'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

type ErrorBoundaryState = ApiErrorBoundaryState

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log to monitoring service if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as { gtag: (type: string, event: string, params: Record<string, unknown>) => void }).gtag
      gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      })
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      return <DefaultErrorFallback error={this.state.error!} retry={this.handleRetry} />
    }

    return this.props.children
  }
}

// Default error fallback component
interface DefaultErrorFallbackProps {
  error: Error
  retry: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, retry }) => {
  const isApiError = error.message.includes('fetch') || error.message.includes('API')

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-heading font-semibold text-text mb-2">
            {isApiError ? 'Service Temporarily Unavailable' : 'Something went wrong'}
          </h2>
          <p className="text-muted text-sm mb-6">
            {isApiError
              ? 'We\'re having trouble connecting to our booking service. This usually resolves itself quickly.'
              : 'An unexpected error occurred. Our team has been notified.'
            }
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>

          <div className="text-xs text-muted">
            <p>If the problem persists, please contact us:</p>
            <p className="mt-1">
              <a
                href="mailto:info@heiwahouse.com"
                className="text-primary hover:underline"
              >
                info@heiwahouse.com
              </a>
              {' • '}
              <a
                href="tel:+351912193785"
                className="text-primary hover:underline"
              >
                +351 912 193 785
              </a>
            </p>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-muted cursor-pointer hover:text-text">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary

