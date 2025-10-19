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
        const response = await fetch('/api/google-reviews')
        const data = await response.json()
        
        if (data.success) {
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
        className={`w-4 h-4 ${
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
            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="text-sm text-white">Loading reviews...</div>
      </div>
    )
  }

  if (error || !reviewsData) {
    // Fallback to static data if API fails
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-1">
          {renderStars(5)}
        </div>
             <div className="text-sm text-white">
               <span className="font-semibold">5.0</span> based on{' '}
               <span className="font-semibold">70</span> reviews
             </div>
        <a
          href="https://www.google.com/maps/place/Heiwa+House/@39.123456,-9.123456,15z"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
        >
          View on Google
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  const { rating, user_ratings_total, reviews } = reviewsData.result

  return (
    <div className={className}>
      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          {renderStars(rating)}
        </div>
        <div className="text-sm text-white">
          <span className="font-semibold">{rating}</span> based on{' '}
          <span className="font-semibold">{user_ratings_total.toLocaleString()}</span> reviews
        </div>
        <a
          href="https://www.google.com/maps/place/Heiwa+House/@39.123456,-9.123456,15z"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
        >
          View on Google
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Individual Reviews */}
      {showReviews && reviews && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.slice(0, maxReviews).map((review, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {review.profile_photo_url && (
                  <img
                    src={review.profile_photo_url}
                    alt={review.author_name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {review.author_name}
                    </span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-gray-500">
                      {review.relative_time_description}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </div>
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
