// CMS Section Content Schemas
// TypeScript interfaces and Zod validation for page section content

import { z } from 'zod'

// Valid page slugs
export const PAGE_SLUGS = [
  'flow', 'play', 'surf', 'the-spot', 'about', 'contact',
  'surf-weeks', 'privacy', 'terms', 'homepage'
] as const

export type PageSlug = typeof PAGE_SLUGS[number]

// Valid section types
export const SECTION_TYPES = [
  'hero', 'intro', 'faq', 'features', 'seo', 'cta',
  'activity_highlight', 'activity_grid',
  'text_block', 'image_gallery', 'video_embed',
  'testimonials', 'custom',
  'local_break', 'surf_lessons'
] as const

export type SectionType = typeof SECTION_TYPES[number]

// Hero Section
export const HeroContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.string().startsWith('/')),
  imageUrl: z.string().url().optional().or(z.string().startsWith('/')),
  overlayOpacity: z.number().min(0).max(100).optional()
})

export type HeroContent = z.infer<typeof HeroContentSchema>

// Intro Section
export const IntroContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required')
})

export type IntroContent = z.infer<typeof IntroContentSchema>

// Activity Highlight Section
export const ActivityHighlightContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  videoUrl: z.string().min(1, 'Video URL is required'),
  videoPoster: z.string().min(1, 'Video poster is required'),
  carouselImages: z.array(z.string()).min(1, 'At least one carousel image is required'),
  reversed: z.boolean().optional().default(false)
})

export type ActivityHighlightContent = z.infer<typeof ActivityHighlightContentSchema>

// Activity Grid Section
export const ActivityGridContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['flow', 'play', 'surf']),
  tier: z.enum(['always', 'on-request']),
  showTierBadge: z.boolean().optional().default(false)
})

export type ActivityGridContent = z.infer<typeof ActivityGridContentSchema>

// FAQ Item
export const FAQItemSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
})

// FAQ Section
export const FAQContentSchema = z.object({
  title: z.string().optional(),
  items: z.array(FAQItemSchema).min(1, 'At least one FAQ item is required')
})

export type FAQContent = z.infer<typeof FAQContentSchema>

// CTA Section
export const CTAContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  buttonText: z.string().min(1, 'Button text is required'),
  buttonUrl: z.string().min(1, 'Button URL is required')
})

export type CTAContent = z.infer<typeof CTAContentSchema>

// Feature Item
export const FeatureItemSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required')
})

// Features Section
export const FeaturesContentSchema = z.object({
  title: z.string().optional(),
  items: z.array(FeatureItemSchema)
})

export type FeaturesContent = z.infer<typeof FeaturesContentSchema>

// SEO Section
export const SEOContentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional()
})

export type SEOContent = z.infer<typeof SEOContentSchema>

// Text Block Section
export const TextBlockContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  alignment: z.enum(['left', 'center', 'right']).optional().default('left')
})

export type TextBlockContent = z.infer<typeof TextBlockContentSchema>

// Image Gallery Section
export const ImageGalleryContentSchema = z.object({
  title: z.string().optional(),
  images: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().optional(),
    caption: z.string().optional()
  })).min(1, 'At least one image is required'),
  layout: z.enum(['grid', 'carousel', 'masonry']).optional().default('grid')
})

export type ImageGalleryContent = z.infer<typeof ImageGalleryContentSchema>

// Video Embed Section
export const VideoEmbedContentSchema = z.object({
  title: z.string().optional(),
  videoUrl: z.string().min(1, 'Video URL is required'),
  posterUrl: z.string().optional(),
  autoplay: z.boolean().optional().default(false),
  loop: z.boolean().optional().default(false)
})

export type VideoEmbedContent = z.infer<typeof VideoEmbedContentSchema>

// Custom Section (flexible)
export const CustomContentSchema = z.record(z.unknown())

export type CustomContent = z.infer<typeof CustomContentSchema>

// Local Break Section (for Surf page)
export const LocalBreakContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  features: z.array(z.object({
    icon: z.enum(['Clock', 'Car', 'Waves']),
    title: z.string().min(1, 'Feature title is required'),
    description: z.string().min(1, 'Feature description is required')
  })).min(1, 'At least one feature is required'),
  disclaimer: z.string().optional(),
  imageUrl: z.string().optional()
})

export type LocalBreakContent = z.infer<typeof LocalBreakContentSchema>

// Surf Lessons Section (for Surf page)
export const SurfLessonsContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  paragraphs: z.array(z.string()).min(1, 'At least one paragraph is required'),
  carouselImages: z.array(z.string()).optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional()
})

export type SurfLessonsContent = z.infer<typeof SurfLessonsContentSchema>

// Map section types to their schemas
export const SECTION_SCHEMAS: Record<SectionType, z.ZodSchema> = {
  hero: HeroContentSchema,
  intro: IntroContentSchema,
  activity_highlight: ActivityHighlightContentSchema,
  activity_grid: ActivityGridContentSchema,
  faq: FAQContentSchema,
  cta: CTAContentSchema,
  features: FeaturesContentSchema,
  seo: SEOContentSchema,
  text_block: TextBlockContentSchema,
  image_gallery: ImageGalleryContentSchema,
  video_embed: VideoEmbedContentSchema,
  testimonials: CustomContentSchema,
  custom: CustomContentSchema,
  local_break: LocalBreakContentSchema,
  surf_lessons: SurfLessonsContentSchema
}

// Page Section (database row)
export interface PageSection {
  id: string
  page_slug: PageSlug
  section_type: SectionType
  content: Record<string, unknown>
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Validate section content based on type
export function validateSectionContent(
  sectionType: SectionType,
  content: unknown
): { success: true; data: unknown } | { success: false; errors: string[] } {
  const schema = SECTION_SCHEMAS[sectionType]
  if (!schema) {
    return { success: false, errors: [`Unknown section type: ${sectionType}`] }
  }

  const result = schema.safeParse(content)
  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
  }
}

// Default content for each section type
export const DEFAULT_SECTION_CONTENT: Record<SectionType, Record<string, unknown>> = {
  hero: {
    title: 'New Hero Section',
    description: 'Add your hero description here',
    videoUrl: '',
    imageUrl: ''
  },
  intro: {
    title: '',
    content: 'Add your introduction text here.'
  },
  activity_highlight: {
    title: 'Activity Title',
    description: 'Describe this activity...',
    videoUrl: '',
    videoPoster: '',
    carouselImages: [],
    reversed: false
  },
  activity_grid: {
    title: 'Activities',
    description: '',
    category: 'flow',
    tier: 'always',
    showTierBadge: false
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: []
  },
  cta: {
    title: 'Call to Action',
    description: '',
    buttonText: 'Learn More',
    buttonUrl: '/'
  },
  features: {
    title: 'Features',
    items: []
  },
  seo: {
    title: '',
    description: '',
    keywords: ''
  },
  text_block: {
    title: '',
    content: '',
    alignment: 'left'
  },
  image_gallery: {
    title: '',
    images: [],
    layout: 'grid'
  },
  video_embed: {
    title: '',
    videoUrl: '',
    posterUrl: '',
    autoplay: false,
    loop: false
  },
  testimonials: {},
  custom: {},
  local_break: {
    title: 'Your Local Break',
    description: 'Just a short walk or quick drive from Heiwa House, you\'ll find beautiful sandy beaches with consistent waves.',
    features: [
      { icon: 'Clock', title: '15-20 minute walk', description: 'Enjoy a beautiful coastal walk down to the beach.' },
      { icon: 'Car', title: '5 minute drive', description: 'Quick and easy access by car.' },
      { icon: 'Waves', title: 'Long sandy beaches', description: 'Miles of coastline to explore.' }
    ],
    disclaimer: '',
    imageUrl: '/images/thehouse.webp'
  },
  surf_lessons: {
    title: 'Surf Lessons',
    paragraphs: [
      'We offer high quality surf lessons in Santa Cruz and Peniche.',
      'Surf lessons starting from 40€ per session, with all equipment included.'
    ],
    carouselImages: ['/images/surf4.jpg', '/images/surf3.jpg'],
    buttonText: 'Book a Surf Lesson',
    buttonUrl: '/surf-weeks'
  }
}

// Human-readable section type names
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'Hero Section',
  intro: 'Introduction',
  activity_highlight: 'Activity Highlight',
  activity_grid: 'Activity Grid',
  faq: 'FAQ',
  cta: 'Call to Action',
  features: 'Features',
  seo: 'SEO Metadata',
  text_block: 'Text Block',
  image_gallery: 'Image Gallery',
  video_embed: 'Video Embed',
  testimonials: 'Testimonials',
  custom: 'Custom Section',
  local_break: 'Local Break Info',
  surf_lessons: 'Surf Lessons'
}
