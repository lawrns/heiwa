import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, User } from 'lucide-react'
import { getPosts } from '@/lib/blog/db'
import { BlogImage } from '@/components/blog/blog-image'
import { formatDateCompact } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Blog - Heiwa House',
  description: 'Stories, tips, and insights from Heiwa House in Santa Cruz, Portugal',
}

export const revalidate = 3600 // Revalidate every hour

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  cover_image_url?: string
  cover_alt_text?: string
  category?: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
  tags?: Array<{
    name: string | undefined
    slug: string | undefined
  }>
  featured?: boolean
  views?: number
  reading_minutes?: number
  published_at?: string
}

interface PostTranslation {
  locale: string
  slug_localized?: string
  title?: string
  excerpt?: string
  cover_image_url?: string
  cover_alt_text?: string
}

interface PostTag {
  tag?: {
    name?: string
    slug?: string
  }
  name?: string
  slug?: string
}

interface PostResponse {
  id: string
  translations?: PostTranslation[]
  category?: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
  tags?: PostTag[]
  featured?: boolean
  views?: number
  reading_minutes?: number
  published_at?: string
}

async function fetchPosts(): Promise<BlogPost[]> {
  try {
    const result = await getPosts({
      status: 'published',
      locale: 'en',
      limit: 20
    })

    // Format posts to match expected structure
    return result.data.map((post: PostResponse) => {
      const translation = post.translations?.find((t: PostTranslation) => t.locale === 'en') || post.translations?.[0]
      
      return {
        id: post.id,
        slug: translation?.slug_localized || '',
        title: translation?.title || '',
        excerpt: translation?.excerpt,
        cover_image_url: translation?.cover_image_url,
        cover_alt_text: translation?.cover_alt_text,
        category: post.category ? {
          name: post.category.name,
          slug: post.category.slug
        } : undefined,
        author: post.author ? {
          name: post.author.name
        } : undefined,
        tags: post.tags?.map((t: PostTag) => ({
          name: t.tag?.name || t.name,
          slug: t.tag?.slug || t.slug
        })).filter((t: { name?: string }) => t.name),
        featured: post.featured,
        views: post.views,
        reading_minutes: post.reading_minutes,
        published_at: post.published_at
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await fetchPosts()
  const featuredPost = posts.find(p => p.featured)
  const regularPosts = posts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">From the Journal</h1>
          <p className="text-xl text-gray-600">
            Stories, tips, and insights from Heiwa House
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="md:flex">
                {featuredPost.cover_image_url && (
                  <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-gray-200">
                    <BlogImage
                      src={featuredPost.cover_image_url}
                      alt={featuredPost.cover_alt_text || featuredPost.title}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  {featuredPost.category && (
                    <span className="text-sm font-medium text-orange-600 mb-2">
                      {featuredPost.category.name}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words hyphens-auto">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {featuredPost.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author.name}</span>
                      </div>
                    )}
                    {featuredPost.published_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateCompact(featuredPost.published_at)}</span>
                      </div>
                    )}
                    {featuredPost.reading_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.reading_minutes} min read</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Posts Grid */}
        {regularPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group flex flex-col"
              >
                {post.cover_image_url && (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                    <BlogImage
                      src={post.cover_image_url}
                      alt={post.cover_alt_text || post.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  {post.category && (
                    <span className="text-sm font-medium text-orange-600 mb-2 block">
                      {post.category.name}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors break-words hyphens-auto line-clamp-3">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {post.author && (
                      <span>{post.author.name}</span>
                    )}
                    {post.published_at && (
                      <span>{formatDateCompact(post.published_at)}</span>
                    )}
                    {post.reading_minutes && (
                      <span>{post.reading_minutes} min</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

