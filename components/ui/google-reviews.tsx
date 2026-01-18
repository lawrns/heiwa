'use client'

import { useState, useEffect } from 'react'
import { Star, ExternalLink } from 'lucide-react'

interface GoogleReview {
  author_name: string
  author_url?: string
  profile_photo_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
}

interface GoogleReviewsData {
  result: {
    rating: number
    user_ratings_total: number
    reviews: GoogleReview[]
  }
  status: string
}

interface GoogleReviewsProps {
  className?: string
  showReviews?: boolean
  maxReviews?: number
}

export function GoogleReviews({ 
  className = '', 
  showReviews = false, 
  maxReviews = 5 
}: GoogleReviewsProps) {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        // Using Google Places API via proxy to avoid CORS issues
        const response = await fetch('/api/google-reviews', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        const data = await response.json()
        
        if (data.success) {
          // If we got fallback data, log it but still use it
          if (data.fallback) {
            console.warn('Google Reviews API:', data.message || data.error || 'Using fallback data')
          }
          setReviewsData(data.data)
        } else {
          setError('Failed to fetch reviews')
        }
      } catch (err) {
        console.error('Error fetching Google reviews:', err)
        setError('Error loading reviews')
      } finally {
        setLoading(false)
      }
    }

    fetchGoogleReviews()
  }, [])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-white/20 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !reviewsData) {
    // Fallback to static data if API fails
    return (
      <div className={className}>
        {!showReviews ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {renderStars(5)}
            </div>
            <div className="text-sm text-white">
              <span className="font-semibold">5.0</span> based on{' '}
              <span className="font-semibold">73</span> reviews
            </div>
            <a
              href="https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 text-xs flex items-center gap-1"
            >
              View on Google
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {renderStars(5)}
                </div>
                <span className="text-lg font-semibold text-gray-900">5.0</span>
                <span className="text-gray-600">(73 reviews)</span>
              </div>
            </div>
            <div className="text-center py-8 text-gray-600">
              <p>Reviews are loading... Please configure GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID environment variables to display real reviews.</p>
              <a
                href="https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
              >
                View reviews on Google Maps →
              </a>
            </div>
          </div>
        )}
      </div>
    )
  }

  const { rating, user_ratings_total, reviews } = reviewsData.result

  return (
    <div className={className}>
      {/* Rating Summary - Only show if not showing individual reviews */}
      {!showReviews && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {renderStars(rating)}
          </div>
          <div className="text-sm text-white">
            <span className="font-semibold">{rating}</span> based on{' '}
            <span className="font-semibold">{user_ratings_total.toLocaleString()}</span> reviews
          </div>
          <a
            href="https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 text-xs flex items-center gap-1"
          >
            View on Google
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      
      {/* Show rating summary above reviews if showing reviews */}
      {showReviews && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-base sm:text-lg font-semibold text-gray-900">{rating}</span>
                <span className="text-sm sm:text-base text-gray-600">({user_ratings_total} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      {showReviews && reviews && reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.slice(0, maxReviews).map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-[box-shadow] duration-200">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                {review.profile_photo_url ? (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    {review.author_name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{review.author_name}</p>
                  <p className="text-gray-500 text-xs">{review.relative_time_description}</p>
                </div>
              </div>
              <div className="flex mb-2 sm:mb-3">
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 line-clamp-4">{review.text}</p>
              <a
                href="https://maps.app.goo.gl/Vy9kZ3K7NcvcyTdB9"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-xs sm:text-sm font-medium inline-block min-h-[44px] flex items-center"
              >
                Read more
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Simplified component for just showing the rating summary
export function GoogleRatingSummary({ className = '' }: { className?: string }) {
  return <GoogleReviews className={className} showReviews={false} />
}

// Default export for dynamic import
export default GoogleRatingSummary
