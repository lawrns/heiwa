'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  Play, Heart, Waves, Bike, Dumbbell, Thermometer, Wind, Droplets, 
  Users, MapPin 
} from 'lucide-react'

interface Experience {
  id: string
  title: string
  description?: string
  image_url: string
  category: string
  icon?: keyof typeof iconMap
  availability_tier: 'always' | 'on-request'
  display_order: number
  active: boolean
  hero_video_url?: string
  hero_image_url?: string
  features?: string[]
}

interface ExperienceGridProps {
  category: string
  tier?: 'always' | 'on-request' | 'all'
  className?: string
  showTierBadge?: boolean
  hideIcons?: boolean
}

const iconMap = {
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
} as const

export function ExperienceGrid({ 
  category, 
  tier = 'all', 
  className = '', 
  showTierBadge = false, 
  hideIcons = false
}: ExperienceGridProps) {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExperiences = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ category })
      if (tier) params.append('tier', tier)
      const response = await fetch(`/api/activities?${params}`)
      const data = await response.json()
      setExperiences(data.data || [])
    } catch (err) {
      console.error('Failed to fetch experiences:', err)
      setExperiences([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [category, tier])

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

  // Don't show error, just show empty state gracefully
  if (experiences.length === 0) {
    return null // Return null to hide the section when there are no experiences
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {experiences.map((experience) => {
        const IconComponent = iconMap[experience.icon || 'play']
        return (
          <div 
            key={experience.id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-[box-shadow] duration-300"
          >
            <div className="relative h-48">
              <Image
                src={experience.image_url || '/images/surf-weeks.jpg'}
                alt={experience.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to surf-weeks.jpg if image fails to load
                  const target = e.target as HTMLImageElement
                  if (target.src !== '/images/surf-weeks.jpg') {
                    target.src = '/images/surf-weeks.jpg'
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Tier Badge */}
              {showTierBadge && (
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    experience.availability_tier === 'always' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {experience.availability_tier === 'always' ? 'Included' : 'On Request'}
                  </span>
                </div>
              )}
              
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  {!hideIcons && (
                    <div className="w-10 h-10 bg-white/90 rounded-lg flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-6 h-6 text-accent" />}
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white">{experience.title}</h3>
                </div>
              </div>
            </div>
            
            {/* Only show content section if there's description or features */}
            {(experience.description || (experience.features && experience.features.length > 0)) && (
              <div className="p-6">
                {experience.description && (
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {experience.description}
                  </p>
                )}

                {experience.features && experience.features.length > 0 && (
                  <ul className="space-y-2">
                    {experience.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                    {experience.features.length > 3 && (
                      <li className="text-sm text-gray-500 italic">
                        +{experience.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
