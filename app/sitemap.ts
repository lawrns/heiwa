import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://heiwahouse.com'
  
  // Static pages
  const staticPages = [
    '',
    '/rooms',
    '/surf-weeks',
    '/surf',
    '/the-spot',
    '/booking',
    '/privacy',
    '/terms',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
  }))

  // Fetch blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select(`
        published_at,
        updated_at,
        translations:blog_post_translations!inner(slug_localized, locale)
      `)
      .eq('status', 'published')
      .eq('translations.locale', 'en')

    if (posts) {
      blogPosts = posts.map((post: any) => {
        const translation = post.translations?.[0] || post.translations
        return {
          url: `${baseUrl}/blog/${translation.slug_localized}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      })
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  return [...staticPages, ...blogPosts]
}

