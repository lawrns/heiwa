// CMS Content Validation Schemas
// Zod schemas for validating all CMS content

import { z } from 'zod'
import type {
  HomepageSection,
  PageContent,
  Testimonial,
  FAQItem,
  MediaItem,
  CTAButton,
  ActivityLog,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCode
} from './cms-types'

// Error codes
export const CMSErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Base schemas
const baseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

// Homepage Section schemas
export const homepageSectionSchema = z.object({
  section_type: z.enum(['hero', 'activities_around', 'what_we_are_about', 'testimonials', 'cta']),
  title: z.string().max(500).optional(),
  subtitle: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  content: z.record(z.string(), z.any()).default({}),
  video_url: z.string().url().optional().or(z.literal('')),
  background_image: z.string().max(500).optional().or(z.literal('')),
  link_url: z.string().max(500).optional().or(z.literal('')),
  link_text: z.string().max(200).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createHomepageSectionSchema = homepageSectionSchema
export const updateHomepageSectionSchema = homepageSectionSchema.partial().omit({ section_type: true })

// Page Content schemas
export const pageContentSchema = z.object({
  page_slug: z.enum(['flow', 'play', 'surf', 'the-spot', 'privacy', 'terms']),
  section: z.enum(['hero', 'intro', 'faq', 'features', 'seo']),
  title: z.string().max(500).optional(),
  content: z.string().max(5000).optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().max(500).optional().or(z.literal('')),
  json_content: z.record(z.string(), z.any()).default({}),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createPageContentSchema = pageContentSchema.omit({})
export const updatePageContentSchema = pageContentSchema.partial().omit({ page_slug: true, section: true })

// Testimonial schemas
export const testimonialSchema = z.object({
  author_name: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(1000),
  image_url: z.string().max(500).optional().or(z.literal('')),
  verified: z.boolean().default(false),
  time_ago: z.string().max(100).optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createTestimonialSchema = testimonialSchema.omit({})
export const updateTestimonialSchema = testimonialSchema.partial()

// FAQ Item schemas
export const faqItemSchema = z.object({
  page_slug: z.enum(['flow', 'play', 'surf', 'the-spot', 'general']),
  category: z.string().max(100).default('general'),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createFAQItemSchema = faqItemSchema.omit({})
export const updateFAQItemSchema = faqItemSchema.partial()

// Media Item schemas
export const mediaItemSchema = z.object({
  filename: z.string().min(1).max(255),
  original_name: z.string().min(1).max(255),
  file_type: z.enum(['image', 'video', 'document']),
  file_size: z.number().int().min(0).optional(),
  supabase_path: z.string().min(1).max(500),
  public_url: z.string().max(500).optional().or(z.literal('')),
  alt_text: z.string().max(500).optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  category: z.string().max(100).default('general'),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createMediaItemSchema = mediaItemSchema.omit({})
export const updateMediaItemSchema = mediaItemSchema.partial().omit({ filename: true, file_type: true, file_size: true, supabase_path: true })

// CTA Button schemas
export const ctaButtonSchema = z.object({
  location: z.string().min(1).max(100),
  text: z.string().min(1).max(200),
  link: z.string().min(1).max(500),
  style: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0).default(0)
})

export const createCTAButtonSchema = ctaButtonSchema.omit({})
export const updateCTAButtonSchema = ctaButtonSchema.partial()

// Activity Log schema
export const activityLogSchema = z.object({
  table_name: z.string().min(1).max(100),
  record_id: z.string().uuid(),
  action: z.enum(['create', 'update', 'delete']),
  old_values: z.record(z.string(), z.any()).optional(),
  new_values: z.record(z.string(), z.any()).optional(),
  user_id: z.string().max(100).optional(),
  ip_address: z.string().optional()
})

// Search and filter schemas
export const searchParamsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sort_by: z.string().max(50).optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc')
})

export const mediaSearchParamsSchema = searchParamsSchema.extend({
  file_type: z.enum(['image', 'video', 'document']).optional(),
  tags: z.array(z.string()).optional()
})

export const faqSearchParamsSchema = searchParamsSchema.extend({
  page_slug: z.enum(['flow', 'play', 'surf', 'the-spot', 'general']).optional(),
  category: z.string().max(100).optional()
})

// Export schemas
export const exportOptionsSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  include_inactive: z.boolean().default(false),
  date_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional()
})

// Validation helper functions
export const validateHomepageSection = (data: unknown) => {
  return homepageSectionSchema.safeParse(data)
}

export const validateCreateHomepageSection = (data: unknown) => {
  return createHomepageSectionSchema.safeParse(data)
}

export const validateUpdateHomepageSection = (data: unknown) => {
  return updateHomepageSectionSchema.safeParse(data)
}

export const validatePageContent = (data: unknown) => {
  return pageContentSchema.safeParse(data)
}

export const validateCreatePageContent = (data: unknown) => {
  return createPageContentSchema.safeParse(data)
}

export const validateUpdatePageContent = (data: unknown) => {
  return updatePageContentSchema.safeParse(data)
}

export const validateTestimonial = (data: unknown) => {
  return testimonialSchema.safeParse(data)
}

export const validateCreateTestimonial = (data: unknown) => {
  return createTestimonialSchema.safeParse(data)
}

export const validateUpdateTestimonial = (data: unknown) => {
  return updateTestimonialSchema.safeParse(data)
}

export const validateFAQItem = (data: unknown) => {
  return faqItemSchema.safeParse(data)
}

export const validateCreateFAQItem = (data: unknown) => {
  return createFAQItemSchema.safeParse(data)
}

export const validateUpdateFAQItem = (data: unknown) => {
  return updateFAQItemSchema.safeParse(data)
}

export const validateMediaItem = (data: unknown) => {
  return mediaItemSchema.safeParse(data)
}

export const validateCreateMediaItem = (data: unknown) => {
  return createMediaItemSchema.safeParse(data)
}

export const validateUpdateMediaItem = (data: unknown) => {
  return updateMediaItemSchema.safeParse(data)
}

export const validateCTAButton = (data: unknown) => {
  return ctaButtonSchema.safeParse(data)
}

export const validateCreateCTAButton = (data: unknown) => {
  return createCTAButtonSchema.safeParse(data)
}

export const validateUpdateCTAButton = (data: unknown) => {
  return updateCTAButtonSchema.safeParse(data)
}

export const validateActivityLog = (data: unknown) => {
  return activityLogSchema.safeParse(data)
}

export const validateSearchParams = (data: unknown) => {
  return searchParamsSchema.safeParse(data)
}

export const validateMediaSearchParams = (data: unknown) => {
  return mediaSearchParamsSchema.safeParse(data)
}

export const validateFAQSearchParams = (data: unknown) => {
  return faqSearchParamsSchema.safeParse(data)
}

export const validateExportOptions = (data: unknown) => {
  return exportOptionsSchema.safeParse(data)
}

// Error handling
export class ValidationError extends Error {
  public details: z.ZodIssue[]

  constructor(message: string, details: z.ZodIssue[]) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export const handleValidationError = (result: { success: false; error: z.ZodError }) => {
  const errorMessages = result.error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
  throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`, result.error.issues)
}

// Type guards
export const isValidHomepageSection = (data: unknown): data is z.infer<typeof homepageSectionSchema> => {
  return homepageSectionSchema.safeParse(data).success
}

export const isValidPageContent = (data: unknown): data is z.infer<typeof pageContentSchema> => {
  return pageContentSchema.safeParse(data).success
}

export const isValidTestimonial = (data: unknown): data is z.infer<typeof testimonialSchema> => {
  return testimonialSchema.safeParse(data).success
}

export const isValidFAQItem = (data: unknown): data is z.infer<typeof faqItemSchema> => {
  return faqItemSchema.safeParse(data).success
}

export const isValidMediaItem = (data: unknown): data is z.infer<typeof mediaItemSchema> => {
  return mediaItemSchema.safeParse(data).success
}

export const isValidCTAButton = (data: unknown): data is z.infer<typeof ctaButtonSchema> => {
  return ctaButtonSchema.safeParse(data).success
}

export const isValidActivityLog = (data: unknown): data is z.infer<typeof activityLogSchema> => {
  return activityLogSchema.safeParse(data).success
}

// Export all schemas for use in API routes
export const schemas = {
  homepageSection: homepageSectionSchema,
  createHomepageSection: createHomepageSectionSchema,
  updateHomepageSection: updateHomepageSectionSchema,
  pageContent: pageContentSchema,
  createPageContent: createPageContentSchema,
  updatePageContent: updatePageContentSchema,
  testimonial: testimonialSchema,
  createTestimonial: createTestimonialSchema,
  updateTestimonial: updateTestimonialSchema,
  faqItem: faqItemSchema,
  createFAQItem: createFAQItemSchema,
  updateFAQItem: updateFAQItemSchema,
  mediaItem: mediaItemSchema,
  createMediaItem: createMediaItemSchema,
  updateMediaItem: updateMediaItemSchema,
  ctaButton: ctaButtonSchema,
  createCTAButton: createCTAButtonSchema,
  updateCTAButton: updateCTAButtonSchema,
  activityLog: activityLogSchema,
  searchParams: searchParamsSchema,
  mediaSearchParams: mediaSearchParamsSchema,
  faqSearchParams: faqSearchParamsSchema,
  exportOptions: exportOptionsSchema
}

// Re-export types for convenience
export type {
  HomepageSection,
  PageContent,
  Testimonial,
  FAQItem,
  MediaItem,
  CTAButton,
  ActivityLog,
  CMSApiResponse,
  CMSListResponse,
  CMSErrorCode
}
