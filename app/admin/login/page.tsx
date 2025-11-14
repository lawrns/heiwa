"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

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
      } catch (err) {
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
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // Clear password field
        setPassword('')
        // Store user email
        localStorage.setItem('userEmail', 'admin@heiwa.house')
        // Redirect to admin dashboard using router
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.message || 'Invalid password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
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
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
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
