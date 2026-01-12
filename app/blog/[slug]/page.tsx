import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import { TipTapRenderer, TipTapDocument } from '@/components/blog/TipTapRenderer'
import { getRelatedPosts } from '@/lib/blog/related-posts'
import { getPostBySlug } from '@/lib/blog/db'

export const revalidate = 3600 // Revalidate every hour

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

interface Tag {
  id: string
  name: string
  slug?: string
}

interface FAQ {
  question: string
  answer: string
}

interface RelatedPostTranslation {
  slug_localized: string
  title: string
  excerpt?: string
  cover_image_url?: string
  cover_alt_text?: string
}

interface RelatedPost {
  id: string
  slug?: string
  title?: string
  excerpt?: string
  cover_image_url?: string
  translations?: RelatedPostTranslation[]
  translation?: RelatedPostTranslation
  category?: { name: string }
}

async function getPost(slug: string) {
  try {
    const post = await getPostBySlug(slug, 'en')
    
    if (!post) {
      return null
    }

    // Format post data to match expected structure
    return {
      id: post.id,
      slug: post.translation.slug_localized,
      title: post.translation.title,
      excerpt: post.translation.excerpt,
      body_rich: post.translation.body_rich,
      cover_image_url: post.translation.cover_image_url,
      cover_alt_text: post.translation.cover_alt_text,
      seo_title: post.translation.seo_title,
      seo_description: post.translation.seo_description,
      canonical_url: post.translation.canonical_url,
      noindex: post.translation.noindex,
      faq_json: post.translation.faq_json,
      category: post.category,
      author: post.author,
      tags: post.tags,
      featured: post.featured,
      views: post.views,
      reading_minutes: post.reading_minutes,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.translation.updated_at || post.updated_at,
      locale: post.translation.locale
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found - Heiwa House Blog',
    }
  }

  const seoTitle = post.seo_title || post.title
  const seoDescription = post.seo_description || post.excerpt || ''
  const canonicalUrl = post.canonical_url || `/blog/${slug}`
  const ogImage = post.cover_image_url || '/images/og/heiwa-house-og.jpg'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heiwahouse.com'

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `${siteUrl}${canonicalUrl}`,
      siteName: 'Heiwa House',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: post.cover_alt_text || post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || post.published_at || undefined,
      authors: post.author ? [post.author.name] : ['Heiwa House'],
      section: post.category?.name,
      tags: post.tags?.map(t => t.name) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`],
      creator: '@heiwahouse',
    },
    alternates: {
      canonical: `${siteUrl}${canonicalUrl}`,
    },
    robots: {
      index: !post.noindex,
      follow: !post.noindex,
      googleBot: {
        index: !post.noindex,
        follow: !post.noindex,
      },
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(
    post.id,
    post.category?.id,
    post.tags?.map(t => t.id),
    4
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          
          {post.category && (
            <span className="text-sm font-medium text-orange-600 mb-4 block">
              {post.category.name}
            </span>
          )}
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 break-words hyphens-auto">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>
            )}
            {post.published_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.published_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
            {post.reading_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.reading_minutes} min read</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.seo_description || post.excerpt || '',
            image: post.cover_image_url ? (post.cover_image_url.startsWith('http') ? post.cover_image_url : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://heiwahouse.com'}${post.cover_image_url}`) : '',
            datePublished: post.published_at,
            dateModified: post.updated_at || post.published_at,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://heiwahouse.com'}/blog/${post.slug}`
            },
            author: {
              '@type': 'Person',
              name: post.author?.name || 'Heiwa House',
              ...(post.author?.avatar_url && {
                image: post.author.avatar_url
              })
            },
            publisher: {
              '@type': 'Organization',
              name: 'Heiwa House',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://heiwahouse.com'}/logo.png`
              }
            },
            ...(post.category && {
              articleSection: post.category.name
            }),
            ...(post.tags && post.tags.length > 0 && {
              keywords: post.tags.map((t: Tag) => t.name).join(', ')
            }),
            ...(post.faq_json && Array.isArray(post.faq_json) && post.faq_json.length > 0 ? {
              mainEntity: {
                '@type': 'FAQPage',
                mainEntity: post.faq_json.map((faq: FAQ) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                  }
                }))
              }
            } : {})
          })
        }}
      />

      {/* Cover Image */}
      {post.cover_image_url && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
            <Image
              src={post.cover_image_url}
              alt={post.cover_alt_text || post.title}
              fill
              className="object-cover"
              priority
              unoptimized={post.cover_image_url.includes('unsplash.com')}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 font-medium">
              {post.excerpt}
            </p>
          )}

          {/* Body Content */}
          <TipTapRenderer content={post.body_rich as TipTapDocument | null | undefined} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: Tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Card */}
          {post.author && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4">
                {post.author.avatar_url && (
                  <Image
                    src={post.author.avatar_url}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                  {post.author.bio && (
                    <p className="text-gray-600 mt-1">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPosts.map((relatedPost: RelatedPost) => {
              const translation = relatedPost.translations?.[0] || relatedPost.translation
              if (!translation) return null
              return (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${translation.slug_localized}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {translation.cover_image_url && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={translation.cover_image_url}
                        alt={translation.cover_alt_text || translation.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={translation.cover_image_url.includes('unsplash.com')}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {relatedPost.category && (
                      <span className="text-xs font-medium text-orange-600 mb-2 block">
                        {relatedPost.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {translation.title}
                    </h3>
                    {translation.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {translation.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

