'use client'

import React from 'react'
import { Search, Filter } from 'lucide-react'

interface CMSHeaderProps {
  title: string
  description: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filterOptions?: {
    label: string
    value: string
  }[]
  selectedFilter?: string
  onFilterChange?: (value: string) => void
  actionButton?: {
    label: string
    icon?: React.ReactNode
    onClick?: () => void
  }
}

export function CMSHeader({
  title,
  description,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  filterOptions = [],
  selectedFilter = '',
  onFilterChange,
  actionButton,
}: CMSHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Title Section */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-heiwaOrange-600 text-white rounded-lg hover:bg-heiwaOrange-700 transition-colors font-medium"
            >
              {actionButton.icon}
              {actionButton.label}
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-8 py-4 flex items-center gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        {/* Filter Dropdown */}
        {filterOptions.length > 0 && onFilterChange && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-heiwaOrange-500 focus:border-transparent transition-all text-sm"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export default CMSHeader
