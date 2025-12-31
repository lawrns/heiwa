'use client'

import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { getUserFriendlyMessage, isNetworkError } from '@/lib/error-handler'
import { useState } from 'react'

interface ErrorMessageProps {
  error: Error | string | unknown
  onRetry?: () => void | Promise<void>
  onDismiss?: () => void
  className?: string
  showRetry?: boolean
  showDismiss?: boolean
}

/**
 * User-friendly error message component with retry functionality
 */
export function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  className = '',
  showRetry = true,
  showDismiss = false,
}: ErrorMessageProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const isNetwork = isNetworkError(error)
  const message = getUserFriendlyMessage(error)

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return
    
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-900 mb-1">
          {isNetwork ? 'Connection Error' : 'Error'}
        </p>
        <p className="text-sm text-red-700">{message}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {showRetry && onRetry && (
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Retry"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
        
        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error message (smaller, for forms)
 */
export function InlineErrorMessage({
  error,
  className = '',
}: {
  error: Error | string | unknown
  className?: string
}) {
  const message = getUserFriendlyMessage(error)
  
  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-red-600 mt-1 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}









