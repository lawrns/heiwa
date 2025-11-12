// Blog Database Helper Functions
// Provides typed database operations for blog system

import { supabase, supabaseAdmin } from '@/lib/supabase'

export interface BlogCategory {
  id: string
  slug: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlogTag {
  id: string
  slug: string
  name: string
  created_at: string
  updated_at: string
}

export interface BlogAuthor {
  id: string
  name: string
  email?: string
  bio?: string
  avatar_url?: string
  social_links?: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  category_id?: string
  author_id?: string
  status: 'draft' | 'scheduled' | 'published'
  featured: boolean
  views: number
  reading_minutes?: number
  scheduled_at?: string
  published_at?: string
  created_at: string
  updated_at: string
  // Joined data
  category?: BlogCategory
  author?: BlogAuthor
  tags?: BlogTag[]
  translations?: BlogPostTranslation[]
}

export interface BlogPostTranslation {
  id: string
  post_id: string
  locale: 'en' | 'fr'
  slug_localized: string
  title: string
  excerpt?: string
  body_rich: any // JSONB TipTap content
  cover_image_url?: string
  cover_alt_text?: string
  seo_title?: string
  seo_description?: string
  canonical_url?: string
  noindex: boolean
  faq_json?: any
  created_at: string
  updated_at: string
}

export interface BlogPostWithTranslation extends BlogPost {
  translation: BlogPostTranslation
}

// Get posts with filters (admin)
export async function getPosts(filters: {
  status?: 'draft' | 'scheduled' | 'published'
  category?: string
  tag?: string
  locale?: 'en' | 'fr'
  author?: string
  featured?: boolean
  search?: string
  page?: number
  limit?: number
} = {}): Promise<{ data: BlogPost[]; count: number }> {
  const {
    status,
    category,
    tag,
    locale,
    author,
    featured,
    search,
    page = 1,
    limit = 20
  } = filters

  let query = supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:blog_authors(*),
      translations:blog_post_translations(*),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `, { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  if (category) {
    query = query.eq('category_id', category)
  }

  if (author) {
    query = query.eq('author_id', author)
  }

  if (featured !== undefined) {
    query = query.eq('featured', featured)
  }

  // Filter by locale in translations
  if (locale) {
    // This requires a more complex query - we'll filter in application code
  }

  // Filter by tag
  if (tag) {
    query = query.contains('tags', [{ tag_id: tag }])
  }

  // Search in translations
  if (search) {
    // This requires joining with translations - simplified for now
  }

  // Ordering
  query = query.order('created_at', { ascending: false })

  // Pagination
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }

  // Transform nested data
  const transformedData = (data || []).map((post: any) => ({
    ...post,
    tags: post.tags?.map((pt: any) => pt.tag) || []
  }))

  // Filter by locale if specified
  let filteredData = transformedData
  if (locale) {
    filteredData = transformedData.map((post: any) => ({
      ...post,
      translations: post.translations?.filter((t: any) => t.locale === locale) || []
    }))
  }

  return {
    data: filteredData as BlogPost[],
    count: count || 0
  }
}

// Get single post by ID (admin)
export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:blog_authors(*),
      translations:blog_post_translations(*),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch post: ${error.message}`)
  }

  return {
    ...data,
    tags: data.tags?.map((pt: any) => pt.tag) || []
  } as BlogPost
}

// Get post by slug and locale (public)
export async function getPostBySlug(
  slug: string,
  locale: 'en' | 'fr' = 'en'
): Promise<BlogPostWithTranslation | null> {
  // First get the translation
  const { data: translation, error: transError } = await supabase
    .from('blog_post_translations')
    .select('*')
    .eq('slug_localized', slug)
    .eq('locale', locale)
    .single()

  if (transError || !translation) {
    return null
  }

  // Get the post with relations
  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:blog_authors(*),
      tags:blog_post_tags(
        tag:blog_tags(*)
      )
    `)
    .eq('id', translation.post_id)
    .eq('status', 'published')
    .single()

  if (postError || !post) {
    return null
  }

  return {
    ...post,
    tags: post.tags?.map((pt: any) => pt.tag) || [],
    translation
  } as BlogPostWithTranslation
}

// Create post
export async function createPost(postData: {
  category_id?: string
  author_id?: string
  status?: 'draft' | 'scheduled' | 'published'
  featured?: boolean
  scheduled_at?: string
  translations: Array<{
    locale: 'en' | 'fr'
    slug_localized: string
    title: string
    excerpt?: string
    body_rich: any
    cover_image_url?: string
    cover_alt_text?: string
    seo_title?: string
    seo_description?: string
    canonical_url?: string
    noindex?: boolean
    faq_json?: any
  }>
  tag_ids?: string[]
}): Promise<BlogPost> {
  // Create post first
  const { data: post, error: postError } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      category_id: postData.category_id,
      author_id: postData.author_id,
      status: postData.status || 'draft',
      featured: postData.featured || false,
      scheduled_at: postData.scheduled_at,
      published_at: postData.status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single()

  if (postError) {
    throw new Error(`Failed to create post: ${postError.message}`)
  }

  // Create translations
  const translations = postData.translations.map(t => ({
    ...t,
    post_id: post.id
  }))

  const { error: transError } = await supabaseAdmin
    .from('blog_post_translations')
    .insert(translations)

  if (transError) {
    // Rollback post creation
    await supabaseAdmin.from('blog_posts').delete().eq('id', post.id)
    throw new Error(`Failed to create translations: ${transError.message}`)
  }

  // Create tag associations
  if (postData.tag_ids && postData.tag_ids.length > 0) {
    const postTags = postData.tag_ids.map(tag_id => ({
      post_id: post.id,
      tag_id
    }))

    const { error: tagError } = await supabaseAdmin
      .from('blog_post_tags')
      .insert(postTags)

    if (tagError) {
      console.error('Failed to create tag associations:', tagError)
      // Don't fail the whole operation for tag errors
    }
  }

  // Return full post with relations
  return getPostById(post.id) as Promise<BlogPost>
}

// Update post
export async function updatePost(
  id: string,
  updates: {
    category_id?: string
    author_id?: string
    status?: 'draft' | 'scheduled' | 'published'
    featured?: boolean
    scheduled_at?: string
    published_at?: string
    translations?: Array<{
      id?: string
      locale: 'en' | 'fr'
      slug_localized?: string
      title?: string
      excerpt?: string
      body_rich?: any
      cover_image_url?: string
      cover_alt_text?: string
      seo_title?: string
      seo_description?: string
      canonical_url?: string
      noindex?: boolean
      faq_json?: any
    }>
    tag_ids?: string[]
  }
): Promise<BlogPost> {
  // Update post metadata
  const postUpdates: any = {}
  if (updates.category_id !== undefined) postUpdates.category_id = updates.category_id
  if (updates.author_id !== undefined) postUpdates.author_id = updates.author_id
  if (updates.status !== undefined) {
    postUpdates.status = updates.status
    if (updates.status === 'published' && !updates.published_at) {
      postUpdates.published_at = new Date().toISOString()
    }
  }
  if (updates.featured !== undefined) postUpdates.featured = updates.featured
  if (updates.scheduled_at !== undefined) postUpdates.scheduled_at = updates.scheduled_at
  if (updates.published_at !== undefined) postUpdates.published_at = updates.published_at

  if (Object.keys(postUpdates).length > 0) {
    const { error: postError } = await supabaseAdmin
      .from('blog_posts')
      .update(postUpdates)
      .eq('id', id)

    if (postError) {
      throw new Error(`Failed to update post: ${postError.message}`)
    }
  }

  // Update translations
  if (updates.translations) {
    for (const translation of updates.translations) {
      if (translation.id) {
        // Update existing translation
        const { error: transError } = await supabaseAdmin
          .from('blog_post_translations')
          .update({
            slug_localized: translation.slug_localized,
            title: translation.title,
            excerpt: translation.excerpt,
            body_rich: translation.body_rich,
            cover_image_url: translation.cover_image_url,
            cover_alt_text: translation.cover_alt_text,
            seo_title: translation.seo_title,
            seo_description: translation.seo_description,
            canonical_url: translation.canonical_url,
            noindex: translation.noindex,
            faq_json: translation.faq_json
          })
          .eq('id', translation.id)

        if (transError) {
          throw new Error(`Failed to update translation: ${transError.message}`)
        }
      } else {
        // Create new translation
        const { error: transError } = await supabaseAdmin
          .from('blog_post_translations')
          .insert({
            post_id: id,
            locale: translation.locale,
            slug_localized: translation.slug_localized || '',
            title: translation.title || '',
            body_rich: translation.body_rich || {}
          })

        if (transError) {
          throw new Error(`Failed to create translation: ${transError.message}`)
        }
      }
    }
  }

  // Update tags
  if (updates.tag_ids !== undefined) {
    // Delete existing tags
    await supabaseAdmin
      .from('blog_post_tags')
      .delete()
      .eq('post_id', id)

    // Insert new tags
    if (updates.tag_ids.length > 0) {
      const postTags = updates.tag_ids.map(tag_id => ({
        post_id: id,
        tag_id
      }))

      const { error: tagError } = await supabaseAdmin
        .from('blog_post_tags')
        .insert(postTags)

      if (tagError) {
        throw new Error(`Failed to update tags: ${tagError.message}`)
      }
    }
  }

  return getPostById(id) as Promise<BlogPost>
}

// Delete post
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`)
  }
}

// Get categories
export async function getCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return data || []
}

// Get tags
export async function getTags(): Promise<BlogTag[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`)
  }

  return data || []
}

// Get authors
export async function getAuthors(): Promise<BlogAuthor[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_authors')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch authors: ${error.message}`)
  }

  return data || []
}

// Increment views
export async function incrementViews(postId: string): Promise<void> {
  try {
    await supabaseAdmin.rpc('increment', {
      table_name: 'blog_posts',
      column_name: 'views',
      id: postId,
      increment: 1
    })
  } catch {
    // Fallback if RPC doesn't exist
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('views')
      .eq('id', postId)
      .single()

    if (data) {
      await supabaseAdmin
        .from('blog_posts')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', postId)
    }
  }
}

// Calculate reading minutes (client-side fallback)
export function calculateReadingMinutes(bodyRich: any): number {
  // Extract text from TipTap JSONB structure
  // This is a simplified version - adjust based on actual TipTap structure
  const text = JSON.stringify(bodyRich)
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

