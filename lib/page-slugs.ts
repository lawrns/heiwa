/**
 * Centralized page slug constants
 *
 * These must match the CHECK constraints in the database:
 * - pages_meta.slug
 * - page_content.page_slug
 * - page_sections.page_slug (no constraint, but should be consistent)
 */

// All valid page slugs in the system
export const VALID_PAGE_SLUGS = [
  'homepage',
  'flow',
  'play',
  'surf',
  'surf-weeks',
  'the-spot',
  'about',
  'contact',
  'privacy',
  'terms',
] as const

// Type for valid page slugs
export type PageSlug = (typeof VALID_PAGE_SLUGS)[number]

// Slugs that have CMS page editor support
export const CMS_EDITABLE_SLUGS = [
  'flow',
  'play',
  'surf',
  'surf-weeks',
  'the-spot',
  'about',
  'contact',
] as const

export type CMSEditableSlug = (typeof CMS_EDITABLE_SLUGS)[number]

// Slugs that support FAQ sections
export const FAQ_PAGE_SLUGS = [
  'flow',
  'play',
  'surf',
  'surf-weeks',
  'the-spot',
  'about',
  'contact',
  'privacy',
  'terms',
  'general',
] as const

export type FAQPageSlug = (typeof FAQ_PAGE_SLUGS)[number]

// Valid section types for page_content table
export const VALID_SECTION_TYPES = ['hero', 'intro', 'faq', 'features', 'seo'] as const

export type SectionType = (typeof VALID_SECTION_TYPES)[number]

// Helper to check if a slug is valid
export function isValidPageSlug(slug: string): slug is PageSlug {
  return VALID_PAGE_SLUGS.includes(slug as PageSlug)
}

// Helper to check if a slug is CMS editable
export function isCMSEditableSlug(slug: string): slug is CMSEditableSlug {
  return CMS_EDITABLE_SLUGS.includes(slug as CMSEditableSlug)
}
