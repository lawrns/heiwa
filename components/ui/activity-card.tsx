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
    <div className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      {/* Background Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-2">
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
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          Info leading into a blogpost style page about the activity. Info leading into a blogpost style page about the activity. 
          Info leading into a blogpost style page about the activity. Info leading into a blogpost style page about the activity. 
          Info leading into a blogpost style page about the activity.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Info leading into a blogpost style page about the activity. Info leading into a blogpost style page about the activity. 
          Info leading into a blogpost style page about the activity. Info leading into a blogpost style page about the activity. 
          Info leading into a blogpost style page about the activity.
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


