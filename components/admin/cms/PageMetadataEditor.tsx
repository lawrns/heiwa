'use client'

import { useState } from 'react'
import AdminButton from '@/components/admin/ui/AdminButton'
import AdminInput from '@/components/admin/ui/AdminInput'
import AdminTextarea from '@/components/admin/ui/AdminTextarea'
import { PageData } from '@/lib/cms-types'

interface PageMetadataEditorProps {
  pageData: PageData
  onSave: (metadata: PageData['metadata']) => void
  onCancel: () => void
}

export default function PageMetadataEditor({
  pageData,
  onSave,
  onCancel
}: PageMetadataEditorProps) {
  const [formData, setFormData] = useState({
    title: pageData.title,
    description: pageData.description,
    seoTitle: pageData.metadata.seoTitle,
    seoDescription: pageData.metadata.seoDescription,
    featuredImage: pageData.metadata.featuredImage
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedMetadata = {
      ...pageData.metadata,
      seoTitle: formData.seoTitle,
      seoDescription: formData.seoDescription,
      featuredImage: formData.featuredImage,
      lastModified: new Date().toISOString()
    }

    onSave(updatedMetadata)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Page Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Page Information</h3>
        <div className="space-y-4">
          <AdminInput
            label="Page Title"
            value={formData.title}
            onChange={(value) => handleInputChange('title', value)}
            placeholder="Enter page title"
            maxLength={100}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter page description"
              maxLength={300}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/300 characters
            </p>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
        <div className="space-y-4">
          <AdminInput
            label="SEO Title"
            value={formData.seoTitle}
            onChange={(value) => handleInputChange('seoTitle', value)}
            placeholder="Enter SEO title (defaults to page title)"
            maxLength={60}
            description="Recommended: 50-60 characters for optimal search results"
          />
          
          <AdminTextarea
            label="SEO Description"
            value={formData.seoDescription}
            onChange={(value) => handleInputChange('seoDescription', value)}
            placeholder="Enter SEO description for search engines"
            maxLength={160}
            rows={3}
            description="Recommended: 150-160 characters for optimal search results"
          />
        </div>
      </div>

      {/* Featured Image */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
        <div className="space-y-4">
          <AdminInput
            label="Image URL"
            value={formData.featuredImage}
            onChange={(value) => handleInputChange('featuredImage', value)}
            placeholder="/images/page-featured.jpg"
            description="Enter the path to the featured image for social sharing"
          />
          
          {formData.featuredImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <img
                  src={formData.featuredImage}
                  alt="Featured image preview"
                  className="w-full h-32 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Page Status</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Last Modified</p>
              <p className="text-sm text-gray-500">
                {new Date(pageData.metadata.lastModified).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Sections</p>
              <p className="text-sm text-gray-500">{pageData.sections.length} total</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Active Sections</p>
              <p className="text-sm text-gray-500">
                {pageData.sections.filter(s => s.is_active).length} active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <AdminButton variant="outline" type="button" onClick={onCancel}>
          Cancel
        </AdminButton>
        <AdminButton variant="primary" type="submit">
          Save Settings
        </AdminButton>
      </div>
    </form>
  )
}
