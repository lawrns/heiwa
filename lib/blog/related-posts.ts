// Related Posts Algorithm
// Finds posts related to a given post based on category, tags, and content similarity

import { supabase } from '@/lib/supabase'
import type { BlogPost } from './db'

export async function getRelatedPosts(
  postId: string,
  categoryId?: string,
  tagIds?: string[],
  limit: number = 4
): Promise<BlogPost[]> {
  try {
    // Build query for published posts excluding the current post
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(*),
        author:blog_authors(*),
        translations:blog_post_translations!inner(*),
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `)
      .eq('status', 'published')
      .eq('translations.locale', 'en')
      .neq('id', postId)

    // If category exists, prioritize posts in same category
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    // Order by published date (most recent first)
    query = query.order('published_at', { ascending: false })

    // Limit results
    query = query.limit(limit * 2) // Get more to filter by tags

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Score and sort posts by relevance
    const scoredPosts = (data || []).map((post: any) => {
      let score = 0

      // Same category = high score
      if (post.category_id === categoryId) {
        score += 10
      }

      // Shared tags = medium score
      if (tagIds && tagIds.length > 0 && post.tags) {
        const sharedTags = post.tags.filter((pt: any) =>
          tagIds.includes(pt.tag?.id)
        ).length
        score += sharedTags * 5
      }

      // Recency bonus (more recent = slightly higher score)
      if (post.published_at) {
        const daysSincePublished = Math.floor(
          (Date.now() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
        )
        score += Math.max(0, 5 - daysSincePublished / 30) // Bonus decreases over time
      }

      return { ...post, _score: score }
    })

    // Sort by score and take top results
    const relatedPosts = scoredPosts
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)
      .map(({ _score, ...post }) => ({
        ...post,
        tags: post.tags?.map((pt: any) => pt.tag) || []
      }))

    // If we don't have enough related posts, fill with recent posts
    if (relatedPosts.length < limit) {
      const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select(`
          *,
          category:blog_categories(*),
          author:blog_authors(*),
          translations:blog_post_translations!inner(*),
          tags:blog_post_tags(
            tag:blog_tags(*)
          )
        `)
        .eq('status', 'published')
        .eq('translations.locale', 'en')
        .neq('id', postId)
        .order('published_at', { ascending: false })
        .limit(limit - relatedPosts.length)

      const additionalPosts = (recentPosts || []).map((post: any) => ({
        ...post,
        tags: post.tags?.map((pt: any) => pt.tag) || []
      }))

      // Filter out duplicates
      const existingIds = new Set(relatedPosts.map(p => p.id))
      const newPosts = additionalPosts.filter(p => !existingIds.has(p.id))

      return [...relatedPosts, ...newPosts].slice(0, limit)
    }

    return relatedPosts as BlogPost[]
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

