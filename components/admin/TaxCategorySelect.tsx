'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface TaxCategory {
  id: string
  name: string
  rate: number
  description: string | null
  is_default: boolean
}

interface TaxCategorySelectProps {
  value?: string | null
  onChange: (taxCategoryId: string | null) => void
  className?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

export function TaxCategorySelect({
  value,
  onChange,
  className = '',
  label = 'Tax Category',
  required = false,
  disabled = false,
}: TaxCategorySelectProps) {
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchTaxCategories = async () => {
      try {
        const response = await fetch('/api/tax-categories')
        const data = await response.json()

        if (data.success) {
          setTaxCategories(data.taxCategories || [])
        }
      } catch (err) {
        console.error('Error fetching tax categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxCategories()
  }, [])

  const selectedCategory = taxCategories.find((cat) => cat.id === value)
  const defaultCategory = taxCategories.find((cat) => cat.is_default)

  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse">
          Loading tax categories...
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            flex items-center justify-between
            ${disabled ? 'text-gray-500' : 'text-gray-900'}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>
            {selectedCategory
              ? `${selectedCategory.name} (${(selectedCategory.rate * 100).toFixed(1)}%)`
              : value
              ? 'Unknown category'
              : defaultCategory
              ? `Default: ${defaultCategory.name} (${(defaultCategory.rate * 100).toFixed(1)}%)`
              : 'Select tax category'}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && !disabled && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {taxCategories.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No tax categories available
                </div>
              ) : (
                <>
                  {taxCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleSelect(category.id)}
                      className={`
                        w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50
                        focus:outline-none transition-colors
                        ${value === category.id ? 'bg-orange-50 text-orange-900' : 'text-gray-900'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {category.description}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-gray-700 ml-4">
                          {(category.rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </>
        )}
      </div>
      {selectedCategory && selectedCategory.description && (
        <p className="mt-1 text-xs text-gray-500">{selectedCategory.description}</p>
      )}
    </div>
  )
}













