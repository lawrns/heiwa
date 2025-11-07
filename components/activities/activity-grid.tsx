'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Play, Heart, Waves, Bike, Dumbbell, Thermometer, Wind, Droplets, 
  Users, MapPin 
} from 'lucide-react'

interface Activity {
  id: string
  title: string
  description?: string
  image_url: string
  category: string
  icon?: string
  availability_tier: 'always' | 'on-request'
  display_order: number
  active: boolean
  hero_video_url?: string
  hero_image_url?: string
  features?: string[]
}

interface ActivityGridProps {
  category: string
  tier?: 'always' | 'on-request' | 'all'
  className?: string
  showTierBadge?: boolean
}

const iconMap: Record<string, any> = {
  play: Play,
  flow: Heart,
  surf: Waves,
  bike: Bike,
  dumbbell: Dumbbell,
  thermometer: Thermometer,
  wind: Wind,
  droplets: Droplets,
  users: Users,
  'map-pin': MapPin,
}

export function ActivityGrid({ 
  category, 
  tier = 'all', 
  className = '', 
  showTierBadge = false 
}: ActivityGridProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchActivities()
  }, [category, tier])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ category })
      if (tier !== 'all') {
        params.append('tier', tier)
      }
      
      const response = await fetch(`/api/activities?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setActivities(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to fetch activities')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
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

  if (activities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No activities found</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {activities.map((activity) => {
        const IconComponent = iconMap[activity.icon || 'play']
        return (
          <div 
            key={activity.id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48">
              <Image
                src={activity.image_url}
                alt={activity.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Tier Badge */}
              {showTierBadge && (
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.availability_tier === 'always' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.availability_tier === 'always' ? 'Included' : 'On Request'}
                  </span>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                    {IconComponent && <IconComponent className="w-6 h-6 text-accent" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">{activity.title}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                {activity.description}
              </p>
              
              {activity.features && activity.features.length > 0 && (
                <ul className="space-y-2">
                  {activity.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      {feature}
                    </li>
                  ))}
                  {activity.features.length > 3 && (
                    <li className="text-sm text-gray-500 italic">
                      +{activity.features.length - 3} more features
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
