"use client"

// Admin Select Component
// Reusable select component for admin forms with validation states

import React from 'react'
import { cn } from '@/lib/utils'

export interface AdminSelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface AdminSelectProps {
  options: AdminSelectOption[]
  value?: string | number
  defaultValue?: string | number
  onChange?: (value: string | number) => void
  onBlur?: () => void
  onFocus?: () => void
  label?: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  selectClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const AdminSelect: React.FC<AdminSelectProps> = ({
  options,
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
  placeholder,
  className,
  selectClassName,
  labelClassName,
  errorClassName
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      
      <select
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        required={required}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus-visible:ring-red-500',
          selectClassName
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
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

export default AdminSelect
