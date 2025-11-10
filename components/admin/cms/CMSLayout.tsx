'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
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
  return (
    <div className="flex h-screen bg-gray-50">
      {/* CMS Navigation Sidebar */}
      <CMSNavigation />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <CMSBreadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1">{description}</p>
              </div>
              {action && (
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors font-medium"
                >
                  {action.icon}
                  {action.label}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
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
