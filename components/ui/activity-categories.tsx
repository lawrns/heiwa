'use client'

import { useEffect, useState } from 'react'
// Using inline button styles to avoid import conflicts

interface ActivityCategory {
  id: string
  name: string
  slug: string
  description?: string
  display_order?: number
  active?: boolean
}

interface ActivityCategoriesProps {
  selectedCategory?: string
  onCategoryChange?: (category: string | null) => void
  className?: string
}

export function ActivityCategories({ 
  selectedCategory, 
  onCategoryChange, 
  className = '' 
}: ActivityCategoriesProps) {
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const response = await fetch('/api/activity-categories')
        const data = await response.json()

        if (data.success) {
          // Add "All" category at the beginning
          const allCategories = [
            { id: 'all', name: 'All Activities', slug: 'all', display_order: 0, active: true },
            ...data.data.sort((a: ActivityCategory, b: ActivityCategory) => 
              (a.display_order || 0) - (b.display_order || 0)
            )
          ]
          setCategories(allCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className={`flex gap-2 flex-wrap ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange?.(category.slug === 'all' ? null : category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
            selectedCategory === category.slug
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
