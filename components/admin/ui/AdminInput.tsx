"use client"

// Admin Input Component
// Reusable input component for admin forms with validation states

import React from 'react'
import { cn } from '@/lib/utils'

export interface AdminInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search'
  placeholder?: string
  value?: string | number
  defaultValue?: string | number
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
  pattern?: string
  className?: string
  inputClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const AdminInput: React.FC<AdminInputProps> = ({
  type = 'text',
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
  pattern,
  className,
  inputClassName,
  labelClassName,
  errorClassName
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      <input
        type={type}
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
        pattern={pattern}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          inputClassName
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
    </div>
  )
}

export default AdminInput
