"use client"

// Admin Button Component
// Reusable button component for admin interface with consistent styling

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'

export interface AdminButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: 'add' | 'edit' | 'delete' | 'save' | 'cancel' | 'view' | 'hide' | 'loading' | React.ReactNode
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  title?: string
}

const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  type = 'button',
  className,
  title
}) => {
  // Map variant to Tailwind classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-orange-600 hover:bg-orange-700 text-white'
      case 'secondary':
        return 'bg-orange-100 hover:bg-orange-200 text-orange-800'
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'outline':
        return 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'ghost':
        return 'hover:bg-orange-100 text-orange-600'
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  }

  // Map size to Tailwind classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-base'
      case 'lg':
        return 'px-6 py-3 text-lg'
      default:
        return 'px-4 py-2 text-base'
    }
  }

  // Get icon component
  const getIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />
    
    switch (icon) {
      case 'add':
        return <Plus className="w-4 h-4" />
      case 'edit':
        return <Edit className="w-4 h-4" />
      case 'delete':
        return <Trash2 className="w-4 h-4" />
      case 'save':
        return <Save className="w-4 h-4" />
      case 'cancel':
        return <X className="w-4 h-4" />
      case 'view':
        return <Eye className="w-4 h-4" />
      case 'hide':
        return <EyeOff className="w-4 h-4" />
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      default:
        return icon
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        getVariantClasses(),
        getSizeClasses(),
        className
      )}
    >
      {icon && getIcon()}
      {children}
    </button>
  )
}

export default AdminButton
