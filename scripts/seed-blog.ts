// Seed Blog with Sample Posts
// Run with: npx tsx scripts/seed-blog.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pguipwhrxdzzrndbluxb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndWlwd2hyeGR6enJuZGJsdXhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjg2NTg4NSwiZXhwIjoyMDc4NDQxODg1fQ.Fe7nN1GEVbgAh0M55HML0ppDgMyyMsCeSk6ugd37TWA'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const samplePosts = [
  {
    title: 'Discovering the Perfect Wave: A Guide to Surfing in Santa Cruz',
    slug: 'discovering-perfect-wave-guide-surfing-santa-cruz',
    excerpt: 'Explore the best surf spots around Santa Cruz, Portugal, and learn what makes this coastal town a surfer\'s paradise.',
    cover_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&h=630&fit=crop',
    cover_alt_text: 'Surfer riding a wave in Santa Cruz',
    category: 'Surfing',
    tags: ['surfing', 'santa-cruz', 'beginners'],
    featured: true,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Santa Cruz, Portugal, is renowned for its consistent waves and beautiful coastline. Whether you\'re a beginner or an experienced surfer, this guide will help you discover the perfect wave.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Best Surf Spots' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'From Praia do Norte to the hidden gems along the coast, Santa Cruz offers diverse surf conditions for every skill level.'
            }
          ]
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Praia do Norte - Perfect for beginners' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Praia da Areia Branca - Intermediate waves' }]
                }
              ]
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Praia do Sul - Advanced breaks' }]
                }
              ]
            }
          ]
        }
      ]
    }
  },
  {
    title: 'Yoga and Wellness: Finding Your Flow at Heiwa House',
    slug: 'yoga-wellness-finding-flow-heiwa-house',
    excerpt: 'Discover how yoga and mindfulness practices can enhance your surf camp experience and create lasting wellness habits.',
    cover_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop',
    cover_alt_text: 'Yoga session at sunset',
    category: 'Wellness',
    tags: ['yoga', 'wellness', 'mindfulness'],
    featured: false,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'At Heiwa House, we believe that surfing and yoga go hand in hand. Our daily yoga sessions help you recover from surf sessions and find balance in your practice.'
            }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Morning Flow Sessions' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Start your day with our energizing morning flow sessions. These classes focus on building strength and flexibility, preparing your body for a day of surfing.'
            }
          ]
        }
      ]
    }
  },
  {
    title: 'Local Culture and Cuisine: Exploring Portuguese Traditions',
    slug: 'local-culture-cuisine-exploring-portuguese-traditions',
    excerpt: 'Immerse yourself in Portuguese culture through local cuisine, traditions, and the warm hospitality of Santa Cruz.',
    cover_image_url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&h=630&fit=crop',
    cover_alt_text: 'Portuguese traditional food',
    category: 'Culture',
    tags: ['culture', 'food', 'portugal'],
    featured: false,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Portugal\'s rich culinary heritage is one of the highlights of visiting Santa Cruz. From fresh seafood to traditional pastries, there\'s something for every palate.'
            }
          ]
        }
      ]
    }
  },
  {
    title: 'Surf Camp Essentials: What to Pack for Your Adventure',
    slug: 'surf-camp-essentials-what-pack-adventure',
    excerpt: 'A comprehensive packing guide to ensure you have everything you need for an unforgettable surf camp experience.',
    cover_image_url: 'https://images.unsplash.com/photo-1551524164-6cf77f5e7f8e?w=1200&h=630&fit=crop',
    cover_alt_text: 'Surf gear and essentials',
    category: 'Tips',
    tags: ['packing', 'essentials', 'guide'],
    featured: false,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Packing for a surf camp requires careful consideration. Here\'s everything you need to bring for a comfortable and successful experience.'
            }
          ]
        }
      ]
    }
  },
  {
    title: 'The Best Time to Visit Santa Cruz: Seasonal Guide',
    slug: 'best-time-visit-santa-cruz-seasonal-guide',
    excerpt: 'Learn about the best seasons to visit Santa Cruz for optimal surf conditions and weather.',
    cover_image_url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=630&fit=crop',
    cover_alt_text: 'Beautiful beach in Santa Cruz',
    category: 'Travel',
    tags: ['travel', 'seasons', 'weather'],
    featured: false,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Santa Cruz offers great surf conditions year-round, but each season brings its own unique characteristics. Here\'s when to plan your visit.'
            }
          ]
        }
      ]
    }
  },
  {
    title: 'Sustainable Surfing: Protecting Our Oceans',
    slug: 'sustainable-surfing-protecting-our-oceans',
    excerpt: 'How we can all contribute to ocean conservation while enjoying the sport we love.',
    cover_image_url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=630&fit=crop',
    cover_alt_text: 'Clean ocean and beach',
    category: 'Sustainability',
    tags: ['sustainability', 'ocean', 'conservation'],
    featured: false,
    body_rich: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'As surfers, we have a special connection to the ocean. Learn how to minimize your environmental impact and contribute to ocean conservation efforts.'
            }
          ]
        }
      ]
    }
  }
]

async function seedBlog() {
  console.log('🌱 Starting blog seeding...\n')

  // Create categories
  const categories: Record<string, string> = {}
  const categoryNames = ['Surfing', 'Wellness', 'Culture', 'Tips', 'Travel', 'Sustainability']
  
  for (const catName of categoryNames) {
    const slug = catName.toLowerCase().replace(/\s+/g, '-')
    const { data, error } = await supabase
      .from('blog_categories')
      .upsert({
        slug,
        name: catName,
        description: `Posts about ${catName.toLowerCase()}`,
        is_active: true
      }, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`Error creating category ${catName}:`, error)
    } else {
      categories[catName] = data.id
      console.log(`✅ Category created: ${catName}`)
    }
  }

  // Create tags
  const tags: Record<string, string> = {}
  const tagNames = ['surfing', 'santa-cruz', 'beginners', 'yoga', 'wellness', 'mindfulness', 'culture', 'food', 'portugal', 'packing', 'essentials', 'guide', 'travel', 'seasons', 'weather', 'sustainability', 'ocean', 'conservation']
  
  for (const tagName of tagNames) {
    const { data, error } = await supabase
      .from('blog_tags')
      .upsert({
        slug: tagName,
        name: tagName.charAt(0).toUpperCase() + tagName.slice(1).replace(/-/g, ' ')
      }, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`Error creating tag ${tagName}:`, error)
    } else {
      tags[tagName] = data.id
    }
  }
  console.log(`✅ Created ${Object.keys(tags).length} tags\n`)

  // Create author (check if exists first)
  let authorId: string
  const { data: existingAuthor } = await supabase
    .from('blog_authors')
    .select('id')
    .eq('email', 'hello@heiwahouse.com')
    .single()

  if (existingAuthor) {
    authorId = existingAuthor.id
    console.log('✅ Using existing author\n')
  } else {
    const { data: authorData, error: authorError } = await supabase
      .from('blog_authors')
      .insert({
        name: 'Heiwa House Team',
        email: 'hello@heiwahouse.com',
        bio: 'The Heiwa House team shares stories, tips, and insights from our surf camp in Santa Cruz, Portugal.',
        is_active: true
      })
      .select()
      .single()

    if (authorError) {
      console.error('Error creating author:', authorError)
      return
    }
    authorId = authorData.id
    console.log('✅ Author created\n')
  }

  // Create posts
  for (const postData of samplePosts) {
    try {
      // Create post
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          category_id: categories[postData.category],
          author_id: authorId,
          status: 'published',
          featured: postData.featured,
          published_at: new Date().toISOString()
        })
        .select()
        .single()

      if (postError) {
        console.error(`Error creating post ${postData.title}:`, postError)
        continue
      }

      // Create translation
      const { error: transError } = await supabase
        .from('blog_post_translations')
        .insert({
          post_id: post.id,
          locale: 'en',
          slug_localized: postData.slug,
          title: postData.title,
          excerpt: postData.excerpt,
          body_rich: postData.body_rich,
          cover_image_url: postData.cover_image_url,
          cover_alt_text: postData.cover_alt_text
        })

      if (transError) {
        console.error(`Error creating translation:`, transError)
        continue
      }

      // Create tag associations
      const tagIds = postData.tags.map(t => tags[t]).filter(Boolean)
      if (tagIds.length > 0) {
        const postTags = tagIds.map(tagId => ({
          post_id: post.id,
          tag_id: tagId
        }))

        await supabase
          .from('blog_post_tags')
          .insert(postTags)
      }

      console.log(`✅ Post created: ${postData.title}`)
    } catch (error) {
      console.error(`Error processing post ${postData.title}:`, error)
    }
  }

  console.log('\n🎉 Blog seeding complete!')
}

seedBlog().catch(console.error)

