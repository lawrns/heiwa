'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ArrowLeft, AlertCircle } from 'lucide-react'
import CMSNavigation from './CMSNavigation'
import CMSBreadcrumb from './CMSBreadcrumb'

interface CMSLayoutProps {
  title: string
  description: string
  children: React.ReactNode
  action?: {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    href?: string
  }
  loading?: boolean
  error?: string | null
}

export function CMSLayout({
  title,
  description,
  children,
  action,
  loading = false,
  error = null,
}: CMSLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          role="button"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}

      {/* CMS Navigation Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <CMSNavigation onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Mobile Menu Button and Back to Admin Link */}
            <div className="flex items-center justify-between mb-4 lg:mb-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
              
              {/* Back to Admin Dashboard Link */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-[background-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            </div>

            <CMSBreadcrumb />
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">{description}</p>
              </div>
              {action && (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-[background-color,box-shadow] duration-200 font-medium text-sm sm:text-base w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heiwaOrange-500/40 focus-visible:ring-offset-2 shadow-sm"
                >
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">Create</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 font-semibold mb-1">Error</p>
                    <p className="text-red-700 text-sm">{error}</p>
                    {error.includes('Failed to') && (
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-sm text-red-700 underline hover:text-red-900"
                      >
                        Try refreshing the page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CMSLayout
