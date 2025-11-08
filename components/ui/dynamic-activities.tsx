'use client'

import { useEffect, useState } from 'react'
import { ActivityCardEnhanced } from './activity-card-enhanced'
import { ActivityCategories } from './activity-categories'
import { Experience } from '@/lib/types'

interface DynamicActivitiesProps {
  category?: string
  limit?: number
  className?: string
  showCategories?: boolean
  onCategoryChange?: (category: string | null) => void
}

export function DynamicActivities({ 
  category, 
  limit = 3, 
  className = '', 
  showCategories = false,
  onCategoryChange 
}: DynamicActivitiesProps) {
  const [activities, setActivities] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        if (limit) params.append('limit', limit.toString())

        const response = await fetch(`/api/activities?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setActivities(data.data.slice(0, limit))
        } else {
          setError(data.error || 'Failed to fetch activities')
        }
      } catch (err) {
        setError('Network error')
        console.error('Error fetching activities:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [category, limit])

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600">Error loading activities: {error}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Category Filter */}
      {showCategories && (
        <div className="mb-8">
          <ActivityCategories
            selectedCategory={category}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}
      
      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activities.map((activity, index) => (
          <ActivityCardEnhanced
            key={activity.id}
            title={activity.title}
            description={activity.description || `Experience ${activity.title} at Heiwa House`}
            image={activity.image}
            href={`/activities/${activity.category?.toLowerCase() || 'general'}/${activity.id}`}
            index={index}
            availabilityTier={activity.availability_tier}
          />
        ))}
      </div>
    </div>
  )
}
