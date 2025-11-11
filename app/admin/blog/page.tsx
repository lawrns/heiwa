'use client'

import Link from 'next/link'
import { BookOpen, FileText, Tag, FolderOpen, User, Plus } from 'lucide-react'

export default function BlogDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
        <p className="text-gray-600 mt-1">Manage your blog content, categories, tags, and authors</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          href="/admin/blog/posts"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </Link>

        <Link
          href="/admin/blog/categories"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <FolderOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Link>

        <Link
          href="/admin/blog/tags"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tags</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <Tag className="h-8 w-8 text-green-600" />
          </div>
        </Link>

        <Link
          href="/admin/blog/authors"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Authors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <User className="h-8 w-8 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/blog/posts/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-orange-100 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New Post</p>
              <p className="text-sm text-gray-600">Create a new blog post</p>
            </div>
          </Link>

          <Link
            href="/admin/blog/categories"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Categories</p>
              <p className="text-sm text-gray-600">Organize your content</p>
            </div>
          </Link>

          <Link
            href="/admin/blog/tags"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Tags</p>
              <p className="text-sm text-gray-600">Add and edit tags</p>
            </div>
          </Link>

          <Link
            href="/admin/blog/authors"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="bg-purple-100 p-2 rounded-lg">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Authors</p>
              <p className="text-sm text-gray-600">Add blog authors</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/blog/posts"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Posts</h3>
              <p className="text-gray-600 text-sm mb-4">
                Create, edit, and manage all your blog posts. Use the rich text editor to create engaging content.
              </p>
              <span className="text-orange-600 font-medium text-sm">Manage Posts →</span>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Organization</h3>
              <p className="text-gray-600 text-sm mb-4">
                Organize your blog content with categories, tags, and authors for better discoverability.
              </p>
              <div className="flex gap-4">
                <Link href="/admin/blog/categories" className="text-blue-600 font-medium text-sm">
                  Categories →
                </Link>
                <Link href="/admin/blog/tags" className="text-green-600 font-medium text-sm">
                  Tags →
                </Link>
                <Link href="/admin/blog/authors" className="text-purple-600 font-medium text-sm">
                  Authors →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

