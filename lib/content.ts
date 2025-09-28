// Static content data for Heiwa House website
// Based on specification requirements

import type {
  NavigationItem,
  Room,
  Experience,
  HomePageContent,
  RoomsPageContent,
  ExperiencesPageContent,
  SurfWeeksPageContent
} from './types'

// Navigation structure
export const navigationItems: NavigationItem[] = [
  { path: '/', name: 'HOME' },
  { path: '/the-spot', name: 'THE SPOT' },
  { path: '/rooms', name: 'ROOM RENTALS' },
  { path: '/surf-weeks', name: 'SURF CAMP' }
]

// Room data
export const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Room Nr 1',
    image: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-52-scaled-570x600.jpg'
  },
  {
    id: 'room-2',
    name: 'Room Nr 2',
    image: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-29-scaled-570x600.webp'
  },
  {
    id: 'room-3',
    name: 'Room Nr 3',
    image: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-22-scaled-570x600.webp'
  },
  {
    id: 'dorm-room',
    name: 'Dorm room',
    image: 'https://heiwahouse.com/wp-content/uploads/2024/12/Freedomroutes-rooms-1-scaled-570x600.webp'
  }
]

// Experience data
export const experiences: Experience[] = [
  {
    id: 'hiking',
    title: 'Hiking',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/8B8BA276-6D91-419B-B8F4-7696042ED92F-01.jpeg'
  },
  {
    id: 'horseback-riding',
    title: 'Horseback Riding',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-39-scaled.jpg'
  },
  {
    id: 'sauna',
    title: 'Sauna',
    image: 'https://heiwahouse.com/wp-content/uploads/2024/12/portrait_sauna3.jpg'
  },
  {
    id: 'surfing',
    title: 'Surfing',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/Surf-Lessons.jpg'
  },
  {
    id: 'skatepark',
    title: 'Skatepark',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/skatepark-1.jpg'
  },
  {
    id: 'yoga',
    title: 'Yoga',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/Yoga.jpg'
  },
  {
    id: 'bicycle-ride',
    title: 'Bicycle Ride',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/Freedomroutes_35mm-7-scaled.jpg'
  },
  {
    id: 'day-trips',
    title: 'Day Trips',
    image: 'https://heiwahouse.com/wp-content/uploads/2025/01/DSCF8628.jpg'
  }
]

// Homepage content
export const homePageContent: HomePageContent = {
  hero: {
    title: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure.',
    subtitle: 'A WAVE AWAY',
    backgroundImage: '/images/hero/heiwa-hero.jpg',
    cta: [{ label: 'EXPLORE', href: '/rooms' }]
  },
  featureCards: [
    {
      title: 'Heiwa Play',
      image: 'https://heiwahouse.com/wp-content/uploads/2025/01/play.jpg',
      href: '/the-spot#play'
    },
    {
      title: 'Heiwa Surf',
      image: 'https://heiwahouse.com/wp-content/uploads/2025/01/surf4.jpg',
      href: '/surf-weeks'
    },
    {
      title: 'Heiwa Flow',
      image: 'https://heiwahouse.com/wp-content/uploads/2024/12/image00023-722x1024.jpeg',
      href: '/the-spot#flow'
    }
  ],
  videoEmbed: {
    provider: 'youtube',
    src: 'https://youtu.be/9nhQiKGsgHg',
    poster: '/images/posters/surfweeks.svg'
  }
}

// Rooms page content
export const roomsPageContent: RoomsPageContent = {
  rooms,
  bookingCta: {
    label: 'Check Availability',
    href: '/rooms#booking'
  }
}

// Experiences page content
export const experiencesPageContent: ExperiencesPageContent = {
  experiences
}

// Surf weeks page content
export const surfWeeksPageContent: SurfWeeksPageContent = {
  videoEmbed: {
    provider: 'youtube',
    src: 'https://youtu.be/9nhQiKGsgHg',
    poster: '/images/posters/surfweeks.svg'
  },
  program: {
    title: 'Surf Weeks Program',
    description: 'Join our comprehensive surf training program designed for all skill levels.',
    features: [
      'Professional surf instruction',
      'Equipment provided',
      'Small group sessions',
      'Beachside accommodation',
      'Video analysis and feedback',
      'Certification upon completion'
    ]
  }
}

// Page metadata for SEO
export const pageMetadata = {
  '/': {
    title: 'Heiwa House - A Wave Away | Surf & Adventure Retreat',
    description: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure. Experience world-class surfing, yoga, and coastal living.'
  },
  '/the-spot': {
    title: 'The Spot - Heiwa House Activities & Amenities',
    description: 'Discover all the activities and amenities at Heiwa House. From surfing and yoga to hiking and horseback riding, find your perfect coastal adventure.'
  },
  '/rooms': {
    title: 'Room Rentals - Heiwa House Accommodation',
    description: 'Book your stay at Heiwa House. Choose from our beautifully appointed rooms and dorm accommodations with ocean views.'
  },
  '/surf-weeks': {
    title: 'Surf Weeks - Professional Surf Training Program',
    description: 'Join our comprehensive surf training program at Heiwa House. Professional instruction for all skill levels with beachside accommodation.'
  }
} as const
