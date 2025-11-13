'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Edit, Trash2, Eye } from 'lucide-react'

interface CMSCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  status?: 'published' | 'draft' | 'archived'
  metadata?: {
    label: string
    value: string
  }[]
  actions?: {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    href?: string
    variant?: 'primary' | 'secondary' | 'danger'
  }[]
  onClick?: () => void
  href?: string
  className?: string
}

export function CMSCard({
  title,
  description,
  icon,
  status,
  metadata = [],
  actions = [],
  onClick,
  href,
  className = '',
}: CMSCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getActionColor = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'text-heiwaOrange-600 hover:text-heiwaOrange-700'
      case 'danger':
        return 'text-red-600 hover:text-red-700'
      default:
        return 'text-gray-600 hover:text-gray-700'
    }
  }

  const content = (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-heiwaOrange-100 rounded-lg flex items-center justify-center text-heiwaOrange-600">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h3>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{description}</p>
          </div>
        </div>
        {status && (
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} flex-shrink-0`}>
            <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
          </span>
        )}
      </div>

      {/* Metadata */}
      {metadata.length > 0 && (
        <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-t border-gray-100 pt-3 sm:pt-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {metadata.map((item, idx) => (
              <div key={idx} className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{item.label}</p>
                <p className="text-sm text-gray-900 mt-1 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100 flex-wrap">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${getActionColor(action.variant)}`}
              title={action.label}
            >
              {action.icon && <span className="w-3 h-3 sm:w-4 sm:h-4">{action.icon}</span>}
              <span className="hidden sm:inline">{!action.icon && action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return content
}

export default CMSCard
