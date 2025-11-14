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
        credentials: 'include', // Important: include credentials to receive cookie
        redirect: 'manual' // Handle redirect manually to check status
      })

      // Handle any successful response (200, 302, 307) or redirect
      // Even if API returns 200 with JSON, we should redirect after successful auth
      if (response.status === 200 || response.status === 302 || response.status === 307 || response.redirected) {
        // Parse response to check if authentication was successful
        // Read response body only once
        const text = await response.text()
        let authSuccess = false
        let data = null
        
        try {
          data = JSON.parse(text)
          authSuccess = data.message === 'Authenticated' || response.status === 302 || response.status === 307
        } catch {
          // If response is not JSON (e.g., redirect), consider it successful
          authSuccess = response.status === 302 || response.status === 307 || response.redirected
        }
        
        if (authSuccess) {
          // Clear password field
          setPassword('')
          // Store user email
          localStorage.setItem('userEmail', 'admin@heiwa.house')
          
          // Get redirect URL from Location header or use default
          const redirectUrl = response.headers.get('Location') || '/admin'
          
          // Wait a brief moment to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Use window.location for hard redirect to ensure cookie is sent
          window.location.href = redirectUrl
          return
        } else {
          // Authentication failed even though status was 200
          setError(data?.message || 'Invalid password')
          setLoading(false)
          return
        }
      }
      
      // If we get here, authentication failed (non-200 status)
      // Try to parse error message
      try {
        const text = await response.text()
        const data = JSON.parse(text)
        setError(data.message || 'Invalid password')
      } catch {
        setError('Invalid password')
      }
      setLoading(false)
    } catch (err) {
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none transform hover:scale-[1.02] disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Sign In'
              )}
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
