'use client'

import { useEffect, useState } from 'react'
import { ExperienceCardEnhanced } from './experience-card-enhanced'
import { ExperienceCategories } from './experience-categories'
import { Experience } from '@/lib/types'

interface DynamicExperiencesProps {
  category: string | null
  onCategoryChange: (category: string | null) => void
  showCategories?: boolean
}

export function DynamicExperiences({ 
  category, 
  onCategoryChange,
  showCategories = true
}: DynamicExperiencesProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExperiences() {
      try {
        setLoading(true)
        const url = category 
          ? `/api/activities?category=${category}&active=true`
          : '/api/activities?active=true'
        const response = await fetch(url)
        const data = await response.json()

        if (data.success) {
          setExperiences(data.data)
        }
      } catch (error) {
        console.error('Error fetching experiences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExperiences()
  }, [category])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      {showCategories && (
        <div className="mb-8">
          <ExperienceCategories
            selectedCategory={category || 'all'}
            onCategoryChange={onCategoryChange}
          />
        </div>
      )}

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {experiences.map((experience, index) => (
          <ExperienceCardEnhanced
            key={experience.id}
            title={experience.title}
            description={experience.description || `Experience ${experience.title} at Heiwa House`}
            image={experience.image_url || '/images/surf-weeks.jpg'}
            href={experience.link_url || `/activities/${experience.id}`}
            index={index}
            availabilityTier={experience.availability_tier}
          />
        ))}
      </div>
    </div>
  )
}
