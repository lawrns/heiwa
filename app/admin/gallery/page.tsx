'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, Edit, Trash2, Upload, Image as ImageIcon, Video, Eye, Download, Search, Filter } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
  category: 'rooms' | 'surf' | 'activities' | 'facilities' | 'general'
  tags: string[]
  isActive: boolean
  uploadedAt: string
  fileSize: number
  dimensions?: { width: number; height: number }
}

export default function AdminGalleryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // This will eventually fetch gallery items from the database
  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: 'Dorm Room Interior',
      type: 'image',
      url: '/images/rooms/dorm-room-1.jpg',
      thumbnailUrl: '/images/rooms/dorm-room-1-thumb.jpg',
      category: 'rooms',
      tags: ['dorm', 'interior', 'bunk-beds'],
      isActive: true,
      uploadedAt: '2024-01-15T10:30:00Z',
      fileSize: 2048576,
      dimensions: { width: 1920, height: 1080 }
    },
    {
      id: '2',
      title: 'Surf Session Video',
      type: 'video',
      url: '/images/videos/surf-session.mp4',
      thumbnailUrl: '/images/videos/surf-session-thumb.jpg',
      category: 'surf',
      tags: ['surfing', 'waves', 'lesson'],
      isActive: true,
      uploadedAt: '2024-01-14T15:45:00Z',
      fileSize: 15728640
    },
    {
      id: '3',
      title: 'Yoga Deck Sunset',
      type: 'image',
      url: '/images/activities/yoga-deck-sunset.jpg',
      thumbnailUrl: '/images/activities/yoga-deck-sunset-thumb.jpg',
      category: 'activities',
      tags: ['yoga', 'sunset', 'deck', 'peaceful'],
      isActive: true,
      uploadedAt: '2024-01-13T18:20:00Z',
      fileSize: 3145728,
      dimensions: { width: 2560, height: 1440 }
    },
    {
      id: '4',
      title: 'Skatepark Overview',
      type: 'image',
      url: '/images/facilities/skatepark-overview.jpg',
      thumbnailUrl: '/images/facilities/skatepark-overview-thumb.jpg',
      category: 'facilities',
      tags: ['skatepark', 'facilities', 'outdoor'],
      isActive: false,
      uploadedAt: '2024-01-12T09:15:00Z',
      fileSize: 1835008,
      dimensions: { width: 1600, height: 900 }
    },
    {
      id: '5',
      title: 'Common Area Evening',
      type: 'image',
      url: '/images/facilities/common-area-evening.jpg',
      thumbnailUrl: '/images/facilities/common-area-evening-thumb.jpg',
      category: 'facilities',
      tags: ['common-area', 'evening', 'cozy'],
      isActive: true,
      uploadedAt: '2024-01-11T20:30:00Z',
      fileSize: 2621440,
      dimensions: { width: 1920, height: 1280 }
    }
  ]

  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: GalleryItem['category']) => {
    switch (category) {
      case 'rooms':
        return <ImageIcon size={16} className="text-blue-500" />
      case 'surf':
        return <Video size={16} className="text-green-500" />
      case 'activities':
        return <ImageIcon size={16} className="text-purple-500" />
      case 'facilities':
        return <ImageIcon size={16} className="text-orange-500" />
      case 'general':
        return <ImageIcon size={16} className="text-gray-500" />
      default:
        return <ImageIcon size={16} className="text-gray-500" />
    }
  }

  const getCategoryColor = (category: GalleryItem['category']) => {
    switch (category) {
      case 'rooms':
        return 'bg-blue-100 text-blue-800'
      case 'surf':
        return 'bg-green-100 text-green-800'
      case 'activities':
        return 'bg-purple-100 text-purple-800'
      case 'facilities':
        return 'bg-orange-100 text-orange-800'
      case 'general':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-2">Manage images and videos for your website</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/gallery/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Media
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-accent/10 text-accent rounded-full p-3">
            <ImageIcon size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{galleryItems.length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-green-100 text-green-600 rounded-full p-3">
            <ImageIcon size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Images</p>
            <p className="text-2xl font-bold text-gray-900">{galleryItems.filter(item => item.type === 'image').length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full p-3">
            <Video size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Videos</p>
            <p className="text-2xl font-bold text-gray-900">{galleryItems.filter(item => item.type === 'video').length}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center space-x-4">
          <div className="flex-shrink-0 bg-purple-100 text-purple-600 rounded-full p-3">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-gray-900">{galleryItems.filter(item => item.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="all">All Categories</option>
              <option value="rooms">Rooms</option>
              <option value="surf">Surf</option>
              <option value="activities">Activities</option>
              <option value="facilities">Facilities</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-gray-200">
                {item.type === 'image' ? (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <Video size={48} className="text-white" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex gap-2">
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Eye size={16} className="text-gray-700" />
                    </button>
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Download size={16} className="text-gray-700" />
                    </button>
                    <Link href={`/admin/gallery/${item.id}`} className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Edit size={16} className="text-gray-700" />
                    </Link>
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'image' ? 'IMG' : 'VID'}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  {getCategoryIcon(item.category)}
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>{formatFileSize(item.fileSize)}</div>
                  {item.dimensions && (
                    <div>{item.dimensions.width} × {item.dimensions.height}</div>
                  )}
                  <div>{formatDate(item.uploadedAt)}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                        {item.type === 'image' ? (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.title}
                            width={64}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Video size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">
                          {item.tags.slice(0, 2).map(tag => `#${tag}`).join(', ')}
                          {item.tags.length > 2 && ` +${item.tags.length - 2} more`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type === 'image' ? 'Image' : 'Video'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(item.fileSize)}
                      {item.dimensions && (
                        <div className="text-xs">{item.dimensions.width}×{item.dimensions.height}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Download className="h-4 w-4" />
                        </button>
                        <Link href={`/admin/gallery/${item.id}`} className="text-accent hover:text-accent-hover">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-600 mb-4">No items match your current search criteria.</p>
          <Link
            href="/admin/gallery/upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-hover"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Link>
        </div>
      )}
    </div>
  )
}

