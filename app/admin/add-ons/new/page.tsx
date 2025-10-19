'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Euro, Users, Calendar } from 'lucide-react'

export default function NewAddOnPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'equipment' as 'equipment' | 'service' | 'experience' | 'transport',
    isActive: true,
    maxQuantity: '',
    requiresBooking: false,
    imageUrl: '',
    detailedDescription: ''
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement actual API call to save add-on
    console.log('Saving add-on:', formData)
    router.push('/admin/add-ons')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <Package size={20} className="text-blue-500" />
      case 'service':
        return <Users size={20} className="text-green-500" />
      case 'experience':
        return <Users size={20} className="text-purple-500" />
      case 'transport':
        return <Package size={20} className="text-orange-500" />
      default:
        return <Package size={20} className="text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Add-on</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Add-on Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                  placeholder="e.g., Surfboard Rental"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent appearance-none"
                    required
                  >
                    <option value="equipment">Equipment</option>
                    <option value="service">Service</option>
                    <option value="experience">Experience</option>
                    <option value="transport">Transport</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {getCategoryIcon(formData.category)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description *
              </label>
              <input
                type="text"
                name="description"
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Brief description for listings"
                required
              />
            </div>

            <div className="mt-6">
              <label htmlFor="detailedDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description
              </label>
              <textarea
                name="detailedDescription"
                id="detailedDescription"
                rows={4}
                value={formData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                placeholder="Detailed information about this add-on..."
              />
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Availability</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (€) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Euro size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Quantity
                </label>
                <input
                  type="number"
                  name="maxQuantity"
                  id="maxQuantity"
                  value={formData.maxQuantity}
                  onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex items-center space-x-3 pt-8">
                <input
                  id="requiresBooking"
                  name="requiresBooking"
                  type="checkbox"
                  checked={formData.requiresBooking}
                  onChange={(e) => handleInputChange('requiresBooking', e.target.checked)}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor="requiresBooking" className="block text-sm text-gray-900">
                  Requires advance booking
                </label>
              </div>
            </div>
          </div>

          {/* Media & Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Media & Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="block text-sm text-gray-900">
                  Active (available for booking)
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(formData.category)}
                    <h4 className="font-semibold text-gray-900">{formData.name || 'Add-on Name'}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{formData.description || 'Description will appear here'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>€{formData.price}</span>
                    {formData.maxQuantity && <span>Max: {formData.maxQuantity}</span>}
                    {formData.requiresBooking && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Booking required
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            Save Add-on
          </button>
        </div>
      </form>
    </div>
  )
}

