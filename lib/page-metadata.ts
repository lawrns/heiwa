import { Metadata } from 'next'
import { supabaseAdmin } from './supabase'

interface PageMeta {
  slug: string
  title: string
  meta_description: string | null
  meta_keywords: string | null
  og_image: string | null
  is_published: boolean
}

/**
 * Fetch page metadata from the CMS database (pages_meta table)
 * For use in generateMetadata functions in server components
 */
export async function getPageMeta(slug: string): Promise<PageMeta | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('pages_meta')
      .select('slug, title, meta_description, meta_keywords, og_image, is_published')
      .eq('slug', slug)
      .single()

    if (error) {
      // If page doesn't exist in CMS, return null
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching page meta:', error)
      return null
    }

    return data as PageMeta
  } catch (error) {
    console.error('Error fetching page metadata:', error)
    return null
  }
}

/**
 * Default metadata for pages that don't have CMS metadata configured
 */
const defaultMetadata: Record<string, { title: string; description: string }> = {
  play: {
    title: 'Play - Activities & Recreation',
    description: 'Discover endless activities at Heiwa House. From skateboarding to table games, yoga to sauna sessions - every day brings new adventures.'
  },
  surf: {
    title: 'Surf - Lessons & Surf Weeks',
    description: 'Join our surf camps and lessons in Portugal. World-class waves, professional instruction, and the perfect surf adventure awaits.'
  },
  flow: {
    title: 'Flow - Yoga & Wellness',
    description: 'Find your flow with yoga sessions, meditation, and wellness activities at Heiwa House. Connect mind, body, and soul by the sea.'
  },
  about: {
    title: 'About Heiwa House',
    description: 'Learn about Heiwa House - your sanctuary for surf, yoga, and coastal living on Portugal\'s beautiful coast.'
  },
  'the-spot': {
    title: 'The Spot - Our Facilities',
    description: 'Explore Heiwa House facilities: surf equipment, yoga spaces, pool, sauna, and everything you need for the perfect retreat.'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Heiwa House. We\'d love to hear from you and help plan your perfect surf and wellness retreat.'
  }
}

/**
 * Generate Next.js Metadata object from CMS page metadata
 * Use in page.tsx files with: export async function generateMetadata() { return generatePageMetadata('slug') }
 */
export async function generatePageMetadata(slug: string): Promise<Metadata> {
  const pageMeta = await getPageMeta(slug)
  const defaults = defaultMetadata[slug] || { title: slug.charAt(0).toUpperCase() + slug.slice(1), description: '' }

  const title = pageMeta?.title || defaults.title
  const description = pageMeta?.meta_description || defaults.description
  const keywords = pageMeta?.meta_keywords?.split(',').map(k => k.trim()).filter(Boolean) || []
  const ogImage = pageMeta?.og_image || '/images/og/heiwa-house-og.jpg'

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    }
  }
}
