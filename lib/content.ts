// Dynamic content data for Heiwa House website
// Fetches from Supabase CMS or falls back to static data

import type {
  NavigationItem,
  Room,
  Experience,
  HomePageContent,
  RoomsPageContent,
  ExperiencesPageContent,
  SurfWeeksPageContent
} from './types'
import { supabase } from './supabase'
import { normalizeImageUrls } from './image-utils'

// Navigation structure - fetch from CMS or use fallback
export const getNavigationItems = async (): Promise<NavigationItem[]> => {
  try {
    const { data, error } = await supabase
      .from('navigation_items')
      .select('name, path')
      .eq('active', true)
      .order('order_index')

    if (error) {
      console.warn('Error fetching navigation from CMS:', error)
      return getFallbackNavigationItems()
    }

    // Filter out THE SPOT and activity items (they're in dropdown)
    const filteredData = data?.filter((item: { name: string; path: string }) => 
      !['/the-spot', '/play', '/flow', '/surf'].includes(item.path)
    ) || []

    return filteredData.map((item: { name: string; path: string }) => ({
      name: item.name,
      path: item.path
    })) || getFallbackNavigationItems()
  } catch (error) {
    console.warn('Error fetching navigation:', error)
    return getFallbackNavigationItems()
  }
}

// Fallback navigation items
const getFallbackNavigationItems = (): NavigationItem[] => [
  { path: '/', name: 'HOME' },
  { path: '/rooms', name: 'ROOM RENTALS' },
  { path: '/surf-weeks', name: 'SURF CAMP' },
  { path: '/play', name: 'PLAY' },
  { path: '/flow', name: 'FLOW' }
]

// For backward compatibility
export const navigationItems = getFallbackNavigationItems()

// Room data - fetch from CMS or use fallback (Hybrid approach)
export const getRooms = async (): Promise<Room[]> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.warn('Error fetching rooms from Supabase:', error)
      return getFallbackRooms()
    }

    if (!data || data.length === 0) {
      return getFallbackRooms()
    }

    const mappedRooms = data.map((room: {
      id: string;
      name: string;
      images?: string[];
      description?: string;
      capacity?: number;
      pricing?: { standard?: number; offSeason?: number };
      bookingType?: string;
      booking_type?: string;
      amenities?: string[];
      isActive?: boolean;
      is_active?: boolean;
    }) => {
      // PRIORITY 1: Use CMS images from database (source of truth)
      // CMS images are uploaded via admin and stored in Supabase Storage
      let images: string[] = [];
      
      if (room.images && Array.isArray(room.images) && room.images.length > 0) {
        // Normalize and fix bucket URLs
        images = normalizeImageUrls(room.images);
        
        // Fix bucket name mismatch: /rooms/ -> /room-images/
        images = images.map(img => {
          if (img && img.includes('/storage/v1/object/public/rooms/') && !img.includes('/room-images/')) {
            return img.replace('/storage/v1/object/public/rooms/', '/storage/v1/object/public/room-images/');
          }
          return img;
        });
        
        // Keep ALL Supabase storage URLs - they are valid CMS images
        images = images.filter(img => {
          if (!img || typeof img !== 'string' || img.trim() === '') return false;
          // Keep all Supabase storage URLs (CMS images)
          if (img.includes('supabase.co/storage/v1/object/public/')) {
            return true;
          }
          // Keep local paths that start with /
          if (img.startsWith('/')) {
            return true;
          }
          // Filter out only truly invalid patterns
          return false;
        });
        
        if (images.length > 0) {
          console.log(`✅ Using ${images.length} CMS image(s) for room "${room.name}"`);
        }
      }
      
      // PRIORITY 2: Only use fallback if CMS has NO images
      // This ensures CMS is always the source of truth
      if (images.length === 0) {
        console.warn(`⚠️ Room "${room.name}" has no CMS images - using fallback`);
        // Use minimal fallback only when CMS has no images
        images = ['/images/rooms/room1.jpg'];
      }

      return {
        id: room.id,
        name: room.name,
        image: images[0], // Primary image for backward compatibility
        images: images,   // Full array of images from database
        description: room.description || undefined,
        capacity: room.capacity || undefined,
        pricing: room.pricing || undefined,
        bookingType: room.bookingType || room.booking_type || undefined,
        amenities: room.amenities && Array.isArray(room.amenities) ? room.amenities : [],
        isActive: room.isActive !== false && room.is_active !== false
      }
    })

    return mappedRooms
  } catch (error) {
    console.warn('Error fetching rooms from Supabase:', error)
    return getFallbackRooms()
  }
}

// Fallback rooms data
export const getFallbackRooms = (): Room[] => [
  {
    id: 'room-1',
    name: 'Room Nr 1',
    image: '/images/rooms/room1.jpg'
  },
  {
    id: 'room-2',
    name: 'Room Nr 2',
    image: '/images/rooms/room2.webp'
  },
  {
    id: 'room-3',
    name: 'Room Nr 3',
    image: '/images/rooms/room3.webp'
  },
  {
    id: 'dorm-room',
    name: 'Dorm room',
    image: '/images/rooms/dorm.webp'
  }
]

// For backward compatibility
export const rooms = getFallbackRooms()

// Experience data - fetch from CMS or use fallback
export const getExperiences = async (): Promise<Experience[]> => {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('active', true)
      .order('title')

    if (error) {
      console.warn('Error fetching experiences from CMS:', error)
      return getFallbackExperiences()
    }

    return data?.map((experience: { id: string; title: string; image_url: string }) => ({
      id: experience.id,
      title: experience.title,
      image: experience.image_url || ''
    })) || getFallbackExperiences()
  } catch (error) {
    console.warn('Error fetching experiences:', error)
    return getFallbackExperiences()
  }
}

// Fallback experiences data
const getFallbackExperiences = (): Experience[] => [
  {
    id: 'hiking',
    title: 'Hiking',
    image: '/images/DSC02767-scaled.jpg'
  },
  {
    id: 'horseback-riding',
    title: 'Horseback Riding',
    image: '/images/DSC01829-Enhanced-NR-2.jpg'
  },
  {
    id: 'sauna',
    title: 'Sauna',
    image: '/images/DSF8812-scaled.jpg'
  },
  {
    id: 'surfing',
    title: 'Surfing',
    image: '/images/surf4.jpg'
  },
  {
    id: 'skatepark',
    title: 'Skatepark',
    image: '/images/skatepark-1.jpg'
  },
  {
    id: 'yoga',
    title: 'Yoga',
    image: '/images/yoga_dome4.jpg'
  },
  {
    id: 'bicycle-ride',
    title: 'Bicycle Ride',
    image: '/images/Freedomroutes-rooms-1.jpg'
  },
  {
    id: 'day-trips',
    title: 'Day Trips',
    image: '/images/DSF8298-scaled.jpg'
  }
]

// For backward compatibility
export const experiences = getFallbackExperiences()

// Homepage content
export const homePageContent: HomePageContent = {
  hero: {
    title: 'Nestled on Portugal\'s coast, Heiwa House is your sanctuary for rest and adventure.',
    subtitle: 'A WAVE AWAY',
    video: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/cms-media/videos/1763932934179_Timeline-1.mp4',
    backgroundImage: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/page-images/homepage/1763932914644_heiwa-hero.jpg',
    cta: [{ label: 'EXPLORE', href: '/rooms' }]
  },
  featureCards: [
    {
      title: 'Play',
      image: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/page-images/the-spot/1763932921124_skatepark-1.jpg',
      href: '/play'
    },
    {
      title: 'Surf',
      image: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/page-images/surf/1763932922433_surf4.jpg',
      href: '/surf-weeks'
    },
    {
      title: 'Flow',
      image: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/page-images/flow/1763932922968_yoga_dome1.jpg',
      href: '/flow'
    }
  ],
  videoEmbed: {
    provider: 'youtube',
    src: 'https://youtu.be/9nhQiKGsgHg',
    poster: 'https://pguipwhrxdzzrndbluxb.supabase.co/storage/v1/object/public/surf-camp-images/1763932926806_surf-weeks-front-page.jpg'
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
