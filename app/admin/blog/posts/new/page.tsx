'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import Link from 'next/link'
import { TipTapEditor } from '@/components/admin/blog/TipTapEditor'
import { CoverImageUpload } from '@/components/admin/blog/CoverImageUpload'

export default function NewPostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [authors, setAuthors] = useState<any[]>([])
  const [formData, setFormData] = useState({
    status: 'draft' as 'draft' | 'scheduled' | 'published',
    featured: false,
    category_id: '',
    author_id: '',
    translations: [
      {
        locale: 'en' as 'en' | 'fr',
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
    ]
  })

  useEffect(() => {
    fetchCategories()
    fetchAuthors()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/admin/blog/posts/${data.data.id}`)
      } else {
        alert(data.error || 'Failed to create post')
      }
    } catch (err) {
      alert('Error creating post')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">New Blog Post</h1>
        <Link
          href="/admin/blog/posts"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <X className="h-5 w-5" />
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title (EN)
          </label>
          <input
            type="text"
            required
            value={formData.translations[0].title}
            onChange={(e) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    title: e.target.value,
                    slug_localized: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '')
                  }
                ]
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter post title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (EN)
          </label>
          <input
            type="text"
            required
            value={formData.translations[0].slug_localized}
            onChange={(e) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    slug_localized: e.target.value
                  }
                ]
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="post-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (EN)
          </label>
          <textarea
            value={formData.translations[0].excerpt}
            onChange={(e) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    excerpt: e.target.value
                  }
                ]
              })
            }
            rows={3}
            maxLength={160}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Brief excerpt (max 160 characters)"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.translations[0].excerpt.length}/160
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (EN)
          </label>
          <TipTapEditor
            content={formData.translations[0].body_rich}
            onChange={(content) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    body_rich: content
                  }
                ]
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
            value={formData.translations[0].cover_image_url}
            onChange={(url) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    cover_image_url: url
                  }
                ]
              })
            }
            altText={formData.translations[0].cover_alt_text}
            onAltTextChange={(alt) =>
              setFormData({
                ...formData,
                translations: [
                  {
                    ...formData.translations[0],
                    cover_alt_text: alt
                  }
                ]
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
                    (formData.translations[0].seo_title?.length || 0) > 60 
                      ? 'text-red-500' 
                      : (formData.translations[0].seo_title?.length || 0) >= 50 
                        ? 'text-green-500' 
                        : 'text-gray-500'
                  }`}>
                    ({(formData.translations[0].seo_title?.length || 0)}/60 recommended)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.translations[0].seo_title || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: [
                        {
                          ...formData.translations[0],
                          seo_title: e.target.value
                        }
                      ]
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
                    (formData.translations[0].seo_description?.length || 0) > 160 
                      ? 'text-red-500' 
                      : (formData.translations[0].seo_description?.length || 0) >= 150 
                        ? 'text-green-500' 
                        : 'text-gray-500'
                  }`}>
                    ({(formData.translations[0].seo_description?.length || 0)}/160 recommended)
                  </span>
                </label>
                <textarea
                  value={formData.translations[0].seo_description || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: [
                        {
                          ...formData.translations[0],
                          seo_description: e.target.value
                        }
                      ]
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
                  value={formData.translations[0].canonical_url || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: [
                        {
                          ...formData.translations[0],
                          canonical_url: e.target.value
                        }
                      ]
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
                  checked={formData.translations[0].noindex || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: [
                        {
                          ...formData.translations[0],
                          noindex: e.target.checked
                        }
                      ]
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
                status: e.target.value as any
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
            disabled={loading}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

