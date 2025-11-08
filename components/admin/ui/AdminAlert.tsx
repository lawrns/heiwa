"use client"

// Admin Alert Component
// Reusable alert component for notifications and messages

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react'

export interface AdminAlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  icon?: boolean
}

const AdminAlert: React.FC<AdminAlertProps> = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon = true
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIconClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'info':
      default:
        return 'text-blue-600'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
      default:
        return <Info className="w-5 h-5" />
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        getVariantClasses(),
        className
      )}
      role="alert"
    >
      <div className="flex">
        {icon && (
          <div className={cn('flex-shrink-0', getIconClasses())}>
            {getIcon()}
          </div>
        )}
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium">
              {title}
            </h3>
          )}
          
          <div className={cn('text-sm', title && 'mt-1')}>
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                getIconClasses(),
                'hover:bg-opacity-20 hover:bg-current'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAlert
