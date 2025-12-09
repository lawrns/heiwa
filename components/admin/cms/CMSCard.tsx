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
    <div className={`bg-white border border-gray-200 rounded-lg p-5 sm:p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 ${className}`}>
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
          <span className={`inline-flex items-center px-3 sm:px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(status)} flex-shrink-0 shadow-sm`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>

      {/* Metadata */}
      {metadata.length > 0 && (
        <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4 sm:pt-5">
          <div className="space-y-3">
            {metadata.map((item, idx) => (
              <div key={idx} className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex items-center gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100 flex-wrap">
          {actions.map((action, idx) => {
            const buttonContent = (
              <>
                {action.icon && <span className="w-3 h-3 sm:w-4 sm:h-4">{action.icon}</span>}
                <span className="hidden sm:inline">{!action.icon && action.label}</span>
              </>
            )
            const buttonClass = `inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${getActionColor(action.variant)}`

            if (action.href) {
              return (
                <Link
                  key={idx}
                  href={action.href}
                  onClick={(e) => e.stopPropagation()}
                  className={buttonClass}
                  title={action.label}
                >
                  {buttonContent}
                </Link>
              )
            }

            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  action.onClick?.()
                }}
                className={buttonClass}
                title={action.label}
              >
                {buttonContent}
              </button>
            )
          })}
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
