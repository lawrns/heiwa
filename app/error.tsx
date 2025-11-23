'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for the application
 * Catches errors in the app directory and shows a user-friendly error page
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error with context
    const { logError } = require('@/lib/error-handler')
    logError(error, {
      component: 'ErrorBoundary',
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We&apos;re sorry for the inconvenience. An unexpected error occurred while loading this page.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
            <p className="text-sm font-semibold text-red-900 mb-2">
              Error Details (Development Only):
            </p>
            <p className="text-xs text-red-700 font-mono break-all">
              {error.message}
            </p>
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-700 cursor-pointer">
                  Stack Trace
                </summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to home
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If this problem persists, please{' '}
          <a href="mailto:info@heiwahouse.com" className="text-orange-600 hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}

