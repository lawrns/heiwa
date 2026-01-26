// CMS Content TypeScript Types
// Defines all types for managing website content through the CMS

export interface HomepageSection {
  id: string
  section_type: 'hero' | 'activities_around' | 'what_we_are_about' | 'testimonials' | 'cta'
  title?: string
  subtitle?: string
  description?: string
  content: Record<string, unknown>
  video_url?: string
  background_image?: string
  link_url?: string
  link_text?: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface PageContent {
  id: string
  page_slug: 'flow' | 'play' | 'surf' | 'the-spot' | 'privacy' | 'terms'
  section: 'hero' | 'intro' | 'faq' | 'features' | 'seo'
  title?: string
  content?: string
  video_url?: string
  image_url?: string
  json_content: Record<string, unknown>
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface PageSection {
  id: string
  page_slug: string
  section_type: 'hero' | 'intro' | 'features' | 'gallery' | 'pricing' | 'text' | 'image_text' | 'video' | 'custom' | 'local_break' | 'surf_lessons' | 'surf_conditions' | 'world_class_surfing'
  section_name: string
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PageData {
  slug: string
  title: string
  description: string
  sections: PageSection[]
  metadata: {
    seoTitle: string
    seoDescription: string
    featuredImage: string
    lastModified: string
  }
}

export interface Testimonial {
  id: string
  author_name: string
  rating: number
  text: string
  image_url?: string
  verified: boolean
  time_ago?: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface FAQItem {
  id: string
  page_slug: 'flow' | 'play' | 'surf' | 'the-spot' | 'general'
  category: string
  question: string
  answer: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MediaItem {
  id: string
  filename: string
  original_name: string
  file_type: 'image' | 'video' | 'document'
  file_size?: number
  supabase_path: string
  public_url?: string
  alt_text?: string
  tags: string[]
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CTAButton {
  id: string
  location: string
  text: string
  link: string
  style: 'primary' | 'secondary' | 'outline'
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  table_name: string
  record_id: string
  action: 'create' | 'update' | 'delete'
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  user_id?: string
  ip_address?: string
  created_at: string
}

// Form types for creating/updating content
export interface CreateHomepageSectionInput {
  section_type: HomepageSection['section_type']
  title?: string
  subtitle?: string
  description?: string
  content?: Record<string, unknown>
  video_url?: string
  background_image?: string
  link_url?: string
  link_text?: string
  is_active?: boolean
  order_index?: number
}

export interface UpdateHomepageSectionInput {
  title?: string
  subtitle?: string
  description?: string
  content?: Record<string, unknown>
  video_url?: string
  background_image?: string
  link_url?: string
  link_text?: string
  is_active?: boolean
  order_index?: number
}

export interface CreatePageContentInput {
  page_slug: PageContent['page_slug']
  section: PageContent['section']
  title?: string
  content?: string
  video_url?: string
  image_url?: string
  json_content?: Record<string, unknown>
  is_active?: boolean
  order_index?: number
}

export interface UpdatePageContentInput {
  title?: string
  content?: string
  video_url?: string
  image_url?: string
  json_content?: Record<string, unknown>
  is_active?: boolean
  order_index?: number
}

export interface CreateTestimonialInput {
  author_name: string
  rating: number
  text: string
  image_url?: string
  verified?: boolean
  time_ago?: string
  is_active?: boolean
  order_index?: number
}

export interface UpdateTestimonialInput {
  author_name?: string
  rating?: number
  text?: string
  image_url?: string
  verified?: boolean
  time_ago?: string
  is_active?: boolean
  order_index?: number
}

export interface CreateFAQItemInput {
  page_slug: FAQItem['page_slug']
  category?: string
  question: string
  answer: string
  order_index?: number
  is_active?: boolean
}

export interface UpdateFAQItemInput {
  page_slug?: FAQItem['page_slug']
  category?: string
  question?: string
  answer?: string
  order_index?: number
  is_active?: boolean
}

export interface CreateMediaItemInput {
  filename: string
  original_name: string
  file_type: MediaItem['file_type']
  file_size?: number
  supabase_path: string
  public_url?: string
  alt_text?: string
  tags?: string[]
  category?: string
  is_active?: boolean
}

export interface UpdateMediaItemInput {
  original_name?: string
  alt_text?: string
  tags?: string[]
  category?: string
  is_active?: boolean
}

export interface CreateCTAButtonInput {
  location: string
  text: string
  link: string
  style?: CTAButton['style']
  is_active?: boolean
  order_index?: number
}

export interface UpdateCTAButtonInput {
  location?: string
  text?: string
  link?: string
  style?: CTAButton['style']
  is_active?: boolean
  order_index?: number
}

// API Response types
export interface CMSApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface CMSListResponse<T> {
  data: T[]
  count: number
  message?: string
  error?: string
}

// Content aggregation types
export interface HomepageContent {
  hero: HomepageSection
  activities_around: HomepageSection
  what_we_are_about: HomepageSection
  testimonials: HomepageSection
  cta: HomepageSection
  testimonials_list: Testimonial[]
}

export interface PageContentWithFAQ {
  hero: PageContent
  intro: PageContent
  faq: PageContent
  faq_items: FAQItem[]
}

// Validation schemas
export const homepageSectionValidation = {
  section_type: ['hero', 'activities_around', 'what_we_are_about', 'testimonials', 'cta'],
  title: { required: false, maxLength: 500 },
  subtitle: { required: false, maxLength: 500 },
  description: { required: false, maxLength: 2000 },
  video_url: { required: false, pattern: /^https?:\/\/.+/ },
  background_image: { required: false, pattern: /^\/.+/ },
  link_url: { required: false, pattern: /^\/.+/ },
  link_text: { required: false, maxLength: 200 },
  is_active: { required: false, type: 'boolean' },
  order_index: { required: false, type: 'number', min: 0 }
}

export const pageContentValidation = {
  page_slug: ['flow', 'play', 'surf', 'the-spot', 'privacy', 'terms'],
  section: ['hero', 'intro', 'faq', 'features', 'seo'],
  title: { required: false, maxLength: 500 },
  content: { required: false, maxLength: 5000 },
  video_url: { required: false, pattern: /^https?:\/\/.+/ },
  image_url: { required: false, pattern: /^\/.+/ },
  is_active: { required: false, type: 'boolean' },
  order_index: { required: false, type: 'number', min: 0 }
}

export const testimonialValidation = {
  author_name: { required: true, maxLength: 200 },
  rating: { required: true, type: 'number', min: 1, max: 5 },
  text: { required: true, maxLength: 1000 },
  image_url: { required: false, pattern: /^\/.+/ },
  verified: { required: false, type: 'boolean' },
  time_ago: { required: false, maxLength: 100 },
  is_active: { required: false, type: 'boolean' },
  order_index: { required: false, type: 'number', min: 0 }
}

export const faqItemValidation = {
  page_slug: ['flow', 'play', 'surf', 'the-spot', 'general'],
  category: { required: false, maxLength: 100 },
  question: { required: true, maxLength: 500 },
  answer: { required: true, maxLength: 2000 },
  is_active: { required: false, type: 'boolean' },
  order_index: { required: false, type: 'number', min: 0 }
}

export const mediaItemValidation = {
  filename: { required: true, maxLength: 255 },
  original_name: { required: true, maxLength: 255 },
  file_type: ['image', 'video', 'document'],
  file_size: { required: false, type: 'number', min: 0 },
  supabase_path: { required: true, maxLength: 500 },
  public_url: { required: false, maxLength: 500 },
  alt_text: { required: false, maxLength: 500 },
  category: { required: false, maxLength: 100 },
  is_active: { required: false, type: 'boolean' }
}

export const ctaButtonValidation = {
  location: { required: true, maxLength: 100 },
  text: { required: true, maxLength: 200 },
  link: { required: true, maxLength: 500 },
  style: ['primary', 'secondary', 'outline'],
  is_active: { required: false, type: 'boolean' },
  order_index: { required: false, type: 'number', min: 0 }
}

// Error types
export interface CMSError {
  code: string
  message: string
  details?: Record<string, any>
}

export const CMSErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

export type CMSErrorCode = typeof CMSErrorCodes[keyof typeof CMSErrorCodes]

// Dashboard statistics types
export interface CMSStats {
  homepage_sections: number
  page_content: number
  testimonials: number
  faq_items: number
  media_items: number
  cta_buttons: number
  recent_activity: ActivityLog[]
}

// Search and filter types
export interface CMSSearchParams {
  search?: string
  category?: string
  is_active?: boolean
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface MediaSearchParams extends CMSSearchParams {
  file_type?: MediaItem['file_type']
  tags?: string[]
}

export interface FAQSearchParams extends CMSSearchParams {
  page_slug?: FAQItem['page_slug']
  category?: string
}

// Export types
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx'
  include_inactive?: boolean
  date_range?: {
    start: string
    end: string
  }
}

export interface ContentExport {
  filename: string
  content: string | Buffer
  mime_type: string
}
