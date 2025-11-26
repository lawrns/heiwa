'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play, Filter } from 'lucide-react'

interface GalleryItem {
  id: string
  title: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  category: string
  tags: string[]
  alt_text?: string
  description?: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery?is_active=true')
      const data = await response.json()
      
      if (data.success && data.galleryItems) {
        setItems(data.galleryItems)
        // Extract unique categories
        const cats = [...new Set(data.galleryItems.map((item: GalleryItem) => item.category))] as string[]
        setCategories(cats)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedItem(null)
    document.body.style.overflow = 'auto'
  }

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!selectedItem) return
    const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    
    if (newIndex >= filteredItems.length) newIndex = 0
    if (newIndex < 0) newIndex = filteredItems.length - 1
    
    setSelectedItem(filteredItems[newIndex])
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItem) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
      if (e.key === 'ArrowRight') navigateLightbox('next')
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItem, filteredItems])

  // Fallback images if gallery is empty
  const fallbackImages = [
    { id: '1', title: 'Heiwa House', type: 'image' as const, url: '/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg', thumbnailUrl: '/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg', category: 'property', tags: [], alt_text: 'Aerial view of Heiwa House' },
    { id: '2', title: 'Surf Session', type: 'image' as const, url: '/images/surf4.jpg', thumbnailUrl: '/images/surf4.jpg', category: 'surf', tags: [], alt_text: 'Surfing in Santa Cruz' },
    { id: '3', title: 'Yoga Dome', type: 'image' as const, url: '/images/yoga_dome1.jpg', thumbnailUrl: '/images/yoga_dome1.jpg', category: 'yoga', tags: [], alt_text: 'Yoga dome at Heiwa House' },
    { id: '4', title: 'Skatepark', type: 'image' as const, url: '/images/skatepark-1.jpg', thumbnailUrl: '/images/skatepark-1.jpg', category: 'activities', tags: [], alt_text: 'Skatepark at Heiwa House' },
    { id: '5', title: 'Room Interior', type: 'image' as const, url: '/images/Freedomroutes-rooms-50.jpg', thumbnailUrl: '/images/Freedomroutes-rooms-50.jpg', category: 'rooms', tags: [], alt_text: 'Room at Heiwa House' },
    { id: '6', title: 'Common Area', type: 'image' as const, url: '/images/DSC03491.jpg', thumbnailUrl: '/images/DSC03491.jpg', category: 'property', tags: [], alt_text: 'Common area at Heiwa House' },
    { id: '7', title: 'Beach View', type: 'image' as const, url: '/images/DSF8619-1.jpg', thumbnailUrl: '/images/DSF8619-1.jpg', category: 'surf', tags: [], alt_text: 'Beach near Heiwa House' },
    { id: '8', title: 'Pool Area', type: 'image' as const, url: '/images/DSC08054-scaled.jpg', thumbnailUrl: '/images/DSC08054-scaled.jpg', category: 'property', tags: [], alt_text: 'Pool at Heiwa House' },
  ]

  const displayItems = items.length > 0 ? filteredItems : fallbackImages
  const displayCategories = items.length > 0 ? categories : ['property', 'surf', 'yoga', 'activities', 'rooms']

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 w-full overflow-hidden bg-gray-900">
        <Image
          src="/images/dji_fly_20240111_135624_97_1704981432374_photo_optimized-1.jpg"
          alt="Heiwa House Gallery"
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Gallery</h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              Explore Heiwa House through our photos and videos
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="h-5 w-5 text-gray-500" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-heiwaOrange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {displayCategories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-heiwaOrange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No images found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group bg-gray-200"
                >
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={item.alt_text || item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Play className="h-8 w-8 text-gray-900" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    {item.category && (
                      <p className="text-white/70 text-xs capitalize">{item.category}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev') }}
            className="absolute left-4 text-white/80 hover:text-white z-10"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next') }}
            className="absolute right-4 text-white/80 hover:text-white z-10"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          {/* Image/Video */}
          <div 
            className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.type === 'video' ? (
              <video
                src={selectedItem.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg"
              />
            ) : (
              <Image
                src={selectedItem.url}
                alt={selectedItem.alt_text || selectedItem.title}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}
          </div>

          {/* Caption */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <p className="text-white text-lg font-medium">{selectedItem.title}</p>
            {selectedItem.description && (
              <p className="text-white/70 text-sm mt-1">{selectedItem.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
