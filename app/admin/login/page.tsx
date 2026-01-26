"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if admin_auth cookie exists by making a request to a protected endpoint
        const response = await fetch('/api/admin/login', {
          method: 'GET',
          credentials: 'include',
        })
        
        if (response.ok) {
          // Already authenticated, redirect to dashboard
          router.push('/admin')
          return
        }
      } catch {
        // Not authenticated, show login form
      } finally {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use fetch API to submit login and handle JSON response
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store admin status for toolbar detection (cookie may not be accessible client-side)
        localStorage.setItem('admin_logged_in', 'true')
        sessionStorage.setItem('admin_logged_in', 'true')
        localStorage.setItem('userEmail', 'admin@heiwa.house')

        // Force a full page reload to ensure sidebar renders correctly
        window.location.href = '/admin'
      } else {
        setError(data.message || 'Invalid password. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Access</h1>
            <p className="text-gray-600 mt-2">Enter your password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 focus-visible:outline-none transition-[border-color,box-shadow,background-color] duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={loading}
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={loading || !password.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Heiwa House Admin Dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
