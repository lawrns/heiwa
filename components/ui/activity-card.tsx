'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Experience } from '@/lib/types'

interface Activity {
  id: string
  title: string
  image: string
  href?: string
}

interface ActivityCardProps {
  activity: Activity
  className?: string
}

export function ActivityCard({ activity, className = '' }: ActivityCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation ${className}`}>
      {/* Background Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 group-active:bg-black/50 transition-colors" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2 leading-tight">
            {activity.title}
          </h3>
        </div>
      </div>
    </div>
  )
}

interface ActivitiesCarouselProps {
  activities?: Activity[]
  className?: string
  category?: string
}

export function ActivitiesCarousel({ activities: initialActivities, className = '', category }: ActivitiesCarouselProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || [])
  const [loading, setLoading] = useState(!initialActivities)

  useEffect(() => {
    if (initialActivities) return // Use provided activities

    async function fetchActivities() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (category) params.append('category', category)

        const response = await fetch(`/api/activities?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          const transformedActivities = data.data.map((exp: Experience) => ({
            id: exp.id,
            title: exp.title,
            image: exp.image,
            href: `/activities/${exp.category?.toLowerCase() || 'general'}`
          }))
          setActivities(transformedActivities)
        }
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [initialActivities, category])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Intro Text */}
      <div className="max-w-4xl mx-auto mb-12">
        <p className="text-lg text-gray-600 leading-relaxed">
          Explore the amazing activities and experiences available around Heiwa House. From water sports to wellness activities, there's something for everyone to enjoy during your stay.
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}



