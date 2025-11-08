"use client"

// Admin Textarea Component
// Reusable textarea component for admin forms with validation states

import React from 'react'
import { cn } from '@/lib/utils'

export interface AdminTextareaProps {
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxLength?: number
  minLength?: number
  rows?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  className?: string
  textareaClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const AdminTextarea: React.FC<AdminTextareaProps> = ({
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  label,
  description,
  error,
  required = false,
  disabled = false,
  readonly = false,
  maxLength,
  minLength,
  rows = 4,
  resize = 'vertical',
  className,
  textareaClassName,
  labelClassName,
  errorClassName
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
  }

  const handleFocus = () => {
    if (onFocus) {
      onFocus()
    }
  }

  const getResizeClass = () => {
    switch (resize) {
      case 'none':
        return 'resize-none'
      case 'both':
        return 'resize'
      case 'horizontal':
        return 'resize-x'
      case 'vertical':
        return 'resize-y'
      default:
        return 'resize-y'
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      
      <textarea
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        maxLength={maxLength}
        minLength={minLength}
        rows={rows}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          getResizeClass(),
          error && 'border-red-500 focus-visible:ring-red-500',
          textareaClassName
        )}
      />
      
      {description && !error && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      
      {error && (
        <p className={cn('text-sm text-red-600', errorClassName)}>
          {error}
        </p>
      )}
      
      {maxLength && (
        <p className="text-xs text-gray-400 text-right">
          {value?.length || 0} / {maxLength}
        </p>
      )}
    </div>
  )
}

export default AdminTextarea
