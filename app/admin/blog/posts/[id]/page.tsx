'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Save, X } from 'lucide-react'
import Link from 'next/link'
import { TipTapEditor } from '@/components/admin/blog/TipTapEditor'
import { CoverImageUpload } from '@/components/admin/blog/CoverImageUpload'

interface Category {
  id: string
  name: string
  slug: string
}

interface Author {
  id: string
  name: string
  email: string
}

interface BlogPost {
  id: string
  status: 'draft' | 'scheduled' | 'published'
  featured: boolean
  category_id: string
  author_id: string
  translations: Array<{
    locale: 'en' | 'fr'
    slug_localized: string
    title: string
    content: string
    excerpt: string
    meta_title?: string
    meta_description?: string
  }>
  cover_image_url?: string
  published_at?: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [, setPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    fetchPost()
    fetchCategories()
    fetchAuthors()
  }, [postId])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/admin/blog/authors')
      const data = await response.json()
      if (data.success) {
        setAuthors(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching authors:', err)
    }
  }

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/posts/${postId}`)
      const data = await response.json()

      if (data.success) {
        setPost(data.data)
        // Initialize form with first translation
        const enTrans = data.data.translations?.find((t: any) => t.locale === 'en') || data.data.translations?.[0]
        setFormData({
          status: data.data.status,
          featured: data.data.featured,
          category_id: data.data.category_id || '',
          author_id: data.data.author_id || '',
          translation: enTrans || {
            locale: 'en',
            slug_localized: '',
            title: '',
            excerpt: '',
            body_rich: {},
            cover_image_url: '',
            cover_alt_text: '',
            seo_title: '',
            seo_description: '',
            canonical_url: '',
            noindex: false
          }
        })
      } else {
        alert(data.error || 'Failed to fetch post')
        router.push('/admin/blog/posts')
      }
    } catch (err) {
      alert('Error loading post')
      console.error(err)
      router.push('/admin/blog/posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const translations = [{
        id: formData.translation.id,
        locale: formData.translation.locale,
        slug_localized: formData.translation.slug_localized,
        title: formData.translation.title,
        excerpt: formData.translation.excerpt,
        body_rich: formData.translation.body_rich,
        cover_image_url: formData.translation.cover_image_url,
        cover_alt_text: formData.translation.cover_alt_text,
        seo_title: formData.translation.seo_title,
        seo_description: formData.translation.seo_description,
        canonical_url: formData.translation.canonical_url,
        noindex: formData.translation.noindex
      }]

      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.status,
          featured: formData.featured,
          category_id: formData.category_id || null,
          author_id: formData.author_id || null,
          translations
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Post updated successfully')
        fetchPost()
      } else {
        alert(data.error || 'Failed to update post')
      }
    } catch (err) {
      alert('Error updating post')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return <div>Post not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <Link
          href="/admin/blog/posts"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <X className="h-5 w-5" />
          Back to Posts
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title ({formData.translation.locale.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={formData.translation.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  title: e.target.value
                }
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug ({formData.translation.locale.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={formData.translation.slug_localized}
            onChange={(e) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  slug_localized: e.target.value
                }
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.translation.excerpt || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  excerpt: e.target.value
                }
              })
            }
            rows={3}
            maxLength={160}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            {(formData.translation.excerpt || '').length}/160
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <TipTapEditor
            content={formData.translation.body_rich || {}}
            onChange={(content) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  body_rich: content
                }
              })
            }
            placeholder="Start writing your blog post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image
          </label>
          <CoverImageUpload
            value={formData.translation.cover_image_url}
            onChange={(url) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  cover_image_url: url
                }
              })
            }
            altText={formData.translation.cover_alt_text}
            onAltTextChange={(alt) =>
              setFormData({
                ...formData,
                translation: {
                  ...formData.translation,
                  cover_alt_text: alt
                }
              })
            }
          />
        </div>

        {/* Category and Author Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category_id: e.target.value
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <select
              value={formData.author_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  author_id: e.target.value
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">No author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SEO Settings Section */}
        <div className="border-t border-gray-200 pt-6">
          <details className="group">
            <summary className="cursor-pointer text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <span>
                SEO Settings
                <span className="text-sm font-normal text-gray-500 ml-2">
                  (Optional - defaults to title/excerpt)
                </span>
              </span>
              <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <div className="mt-4 space-y-4">
              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                  <span className={`text-xs ml-2 ${
                    (formData.translation.seo_title?.length || 0) > 60 
                      ? 'text-red-500' 
                      : (formData.translation.seo_title?.length || 0) >= 50 
                        ? 'text-green-500' 
                        : 'text-gray-500'
                  }`}>
                    ({(formData.translation.seo_title?.length || 0)}/60 recommended)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.translation.seo_title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translation: {
                        ...formData.translation,
                        seo_title: e.target.value
                      }
                    })
                  }
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Leave empty to use post title"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 50-60 characters. Leave empty to use post title.
                </p>
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                  <span className={`text-xs ml-2 ${
                    (formData.translation.seo_description?.length || 0) > 160 
                      ? 'text-red-500' 
                      : (formData.translation.seo_description?.length || 0) >= 150 
                        ? 'text-green-500' 
                        : 'text-gray-500'
                  }`}>
                    ({(formData.translation.seo_description?.length || 0)}/160 recommended)
                  </span>
                </label>
                <textarea
                  value={formData.translation.seo_description || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translation: {
                        ...formData.translation,
                        seo_description: e.target.value
                      }
                    })
                  }
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Leave empty to use excerpt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 150-160 characters. Leave empty to use excerpt.
                </p>
              </div>

              {/* Canonical URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={formData.translation.canonical_url || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translation: {
                        ...formData.translation,
                        canonical_url: e.target.value
                      }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Leave empty for default: /blog/{slug}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use if this content appears elsewhere. Leave empty for default URL.
                </p>
              </div>

              {/* Noindex */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noindex"
                  checked={formData.translation.noindex || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translation: {
                        ...formData.translation,
                        noindex: e.target.checked
                      }
                    })
                  }
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="noindex" className="ml-2 block text-sm text-gray-700">
                  Prevent search engines from indexing this post
                </label>
              </div>
            </div>
          </details>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) =>
              setFormData({
                ...formData,
                featured: e.target.checked
              })
            }
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Featured post
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

