import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    // Fetch published posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        translations:blog_post_translations!inner(*)
      `)
      .eq('status', 'published')
      .eq('translations.locale', 'en')
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heiwahouse.com'
    const siteUrl = `${baseUrl}/blog`
    
    // Build RSS XML
    const rssItems = (posts || []).map((post: any) => {
      const translation = post.translations?.[0] || post.translations
      const postUrl = `${baseUrl}/blog/${translation.slug_localized}`
      const pubDate = post.published_at 
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString()

      return `
    <item>
      <title><![CDATA[${translation.title || ''}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${translation.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${translation.cover_image_url ? `<enclosure url="${translation.cover_image_url}" type="image/jpeg" />` : ''}
    </item>`
    }).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Heiwa House Blog</title>
    <link>${siteUrl}</link>
    <description>Stories, tips, and insights from Heiwa House in Santa Cruz, Portugal</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error: any) {
    console.error('Error generating RSS feed:', error)
    return new NextResponse('Error generating RSS feed', { status: 500 })
  }
}

