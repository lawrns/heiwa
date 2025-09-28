// Payload CMS integration utilities for Heiwa House website
// Currently using static content as fallback until CMS is implemented

import { env } from '@/config/environment'
import { homePageContent, experiencesPageContent, surfWeeksPageContent } from './content'
import type {
  HomePageContent,
  ExperiencesPageContent,
  SurfWeeksPageContent,
  Page,
  PageContent
} from './types'

// Payload CMS client (placeholder - will be replaced with actual Payload client)
class PayloadClient {
  private baseUrl: string

  constructor(baseUrl: string = env.payload.publicServerUrl) {
    this.baseUrl = baseUrl
  }

  // Placeholder methods - will be replaced with actual Payload queries
  async getHomePage(): Promise<HomePageContent> {
    // In production, this would fetch from Payload CMS
    // For now, return static content
    return homePageContent
  }

  async getExperiencesPage(): Promise<ExperiencesPageContent> {
    return experiencesPageContent
  }

  async getSurfWeeksPage(): Promise<SurfWeeksPageContent> {
    return surfWeeksPageContent
  }

  async getPage(_slug: string): Promise<Page | null> {
    // Placeholder - would fetch page by slug from CMS
    return null
  }
}

// Singleton instance
export const payloadClient = new PayloadClient()

// Content fetching utilities
export const getHomePageContent = async (): Promise<HomePageContent> => {
  try {
    // Try to fetch from CMS first
    if (env.app.isProduction && env.payload.secret) {
      return await payloadClient.getHomePage()
    }
  } catch (error) {
    console.warn('Failed to fetch from CMS, using static content:', error)
  }

  // Fallback to static content
  return homePageContent
}

export const getExperiencesPageContent = async (): Promise<ExperiencesPageContent> => {
  try {
    if (env.app.isProduction && env.payload.secret) {
      return await payloadClient.getExperiencesPage()
    }
  } catch (error) {
    console.warn('Failed to fetch from CMS, using static content:', error)
  }

  return experiencesPageContent
}

export const getSurfWeeksPageContent = async (): Promise<SurfWeeksPageContent> => {
  try {
    if (env.app.isProduction && env.payload.secret) {
      return await payloadClient.getSurfWeeksPage()
    }
  } catch (error) {
    console.warn('Failed to fetch from CMS, using static content:', error)
  }

  return surfWeeksPageContent
}

// Generic page fetching (for future use)
export const getPageContent = async (slug: string): Promise<PageContent | null> => {
  try {
    if (env.app.isProduction && env.payload.secret) {
      const page = await payloadClient.getPage(slug)
      return page?.content || null
    }
  } catch (error) {
    console.warn(`Failed to fetch page "${slug}" from CMS:`, error)
  }

  // Fallback logic for known pages
  switch (slug) {
    case 'home':
      return homePageContent
    case 'experiences':
      return experiencesPageContent
    case 'surf-weeks':
      return surfWeeksPageContent
    default:
      return null
  }
}

// CMS status utilities
export const isCmsEnabled = (): boolean => {
  return !!(env.payload.secret && env.payload.mongoUri)
}

export const getCmsStatus = () => ({
  enabled: isCmsEnabled(),
  environment: env.app.isProduction ? 'production' : 'development',
  hasSecret: !!env.payload.secret,
  hasMongoUri: !!env.payload.mongoUri,
})

// Migration utilities (for when CMS is implemented)
export const migrateStaticContentToCms = async () => {
  if (!isCmsEnabled()) {
    console.warn('CMS not enabled, skipping migration')
    return
  }

  console.log('Migrating static content to Payload CMS...')
  // This would contain migration logic when CMS is implemented
  // - Create collections
  // - Import static content
  // - Validate data integrity
}

// Content validation utilities
export const validateContent = (content: unknown): boolean => {
  // Basic validation - would be more comprehensive with CMS schema
  return content !== null && typeof content === 'object'
}

export const logContentFetch = (page: string, source: 'cms' | 'static') => {
  console.log(`📄 ${page} content loaded from ${source}`)
}

export default payloadClient
