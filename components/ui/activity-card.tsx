'use client'

import Image from 'next/image'

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
  activities: Activity[]
  className?: string
}

export function ActivitiesCarousel({ activities, className = '' }: ActivitiesCarouselProps) {
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



