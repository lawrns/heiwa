'use client'

import { Star, CheckCircle } from 'lucide-react'

interface Review {
  id: string
  name: string
  rating: number
  text: string
  timeAgo: string
  verified?: boolean
}

interface ReviewCardProps {
  review: Review
  className?: string
}

export function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            G
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-gray-900 text-sm">{review.name}</span>
              {review.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <span className="text-xs text-gray-500">{review.timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-1 mb-3">
        {renderStars(review.rating)}
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm leading-relaxed mb-2">
        {review.text}
      </p>

      {/* Read More Link */}
      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
        Read more
      </button>
    </div>
  )
}

interface GoogleReviewsProps {
  reviews: Review[]
  rating: number
  reviewCount: number
  onReviewUs: () => void
}

export function GoogleReviews({ reviews, rating, reviewCount, onReviewUs }: GoogleReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="w-full">
      {/* Google Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
            G
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{rating}</span>
              <div className="flex items-center space-x-1">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-600">({reviewCount.toLocaleString()})</span>
            </div>
          </div>
        </div>
        <button
          onClick={onReviewUs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Review us on Google
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}


