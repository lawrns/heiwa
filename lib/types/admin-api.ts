// TypeScript types for Admin API routes
// These types replace 'any' usages to satisfy ESLint @typescript-eslint/no-explicit-any

// Homepage content types
export interface HomepageSection {
  id: string
  section: string
  title: string
  subtitle?: string
  description?: string
  content?: string
  imageUrl?: string
  videoUrl?: string
  videoId?: string
  linkUrl?: string
  linkText?: string
  isActive: boolean
  order: number
  
  // Complex content fields for different section types
  cards?: CardData[]
  bookingData?: BookingData[]
  testimonials?: TestimonialData[]
  facilities?: FacilityData[]
  googleRating?: GoogleRatingData
  blogConfig?: BlogConfigData
}

export interface BlogConfigData {
  limit?: number
  showCategory?: boolean
  showDate?: boolean
  showReadingTime?: boolean
}

export interface CardData {
  id?: string
  title: string
  description: string
  image?: string
  images?: string[]
  link?: string
  mediaType?: 'image' | 'video'
  mediaUrl?: string
}

export interface BookingData {
  id?: string
  dates: string
  price: string
  availableSpots: string
  totalSpots?: number
}

export interface TestimonialData {
  id?: string
  name: string
  rating: number
  text: string
  timeAgo: string
  verified: boolean
}

export interface FacilityData {
  id?: string
  title: string
  description: string
  mediaType: 'image' | 'video'
  mediaUrl: string
}

export interface GoogleRatingData {
  rating: number
  totalReviews: number
  url: string
}

// CMS Settings types
export interface CMSSettings {
  id?: number
  site_name: string
  site_description: string
  default_language: string
  enable_cache: boolean
  cache_duration: number
  updated_at?: string
}

export interface CMSSettingsUpdate {
  site_name?: string
  site_description?: string
  default_language?: string
  enable_cache?: boolean
  cache_duration?: number
}

// Analytics types
export interface AnalyticsOverviewData {
  contentCounts: {
    homepageSections: number
    pageContent: number
    testimonials: number
    faqItems: number
    mediaLibrary: number
  }
  pageStats: Record<string, number>
  ratingStats: Record<string, number>
  faqStats: Record<string, number>
}

export interface AnalyticsContentData {
  recentActivity: ActivityLogItem[]
  typeStats: Record<string, number>
}

export interface AnalyticsTestimonialsData {
  totalTestimonials: number
  featuredTestimonials: number
  averageRating: string
  recentTestimonials: number
}

export interface AnalyticsDashboardData {
  stats: DashboardStat[]
  recentBookings: RecentBooking[]
}

export interface DashboardStat {
  name: string
  value: string
  icon: string
  change: string
  changeType: 'positive' | 'negative'
}

export interface RecentBooking {
  id: string
  guest: string
  room: string
  checkIn: string
  status: string
}

export interface ActivityLogItem {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user_id: string
  created_at: string
}

export interface PageContentItem {
  id: string
  page_slug: string
  section_type: string
}

export interface TestimonialItem {
  id: string
  rating: number
  is_featured: boolean
  created_at: string
}

export interface FAQItem {
  id: string
  category: string
}

export interface BookingRevenueItem {
  total_amount: number
}

export interface BookingListItem {
  id: string
  check_in: string
  payment_status: string
  room_type?: string
}

// Generic API response types
export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface APIErrorResponse {
  success: false
  error: string
  code?: string
  details?: string
  debug?: {
    message: string
    type: string
    timestamp: string
  }
}

// Database query result types
export type SupabaseQueryResult<T> = {
  data: T[] | null
  error: {
    message: string
    code?: string
    details?: string
    hint?: string
  } | null
}

export type SupabaseSingleResult<T> = {
  data: T | null
  error: {
    message: string
    code?: string
    details?: string
    hint?: string
  } | null
}
