'use client'

import { motion } from 'framer-motion'
import { Clock, Users, AlertTriangle } from 'lucide-react'

interface UrgencyMessageProps {
  type: 'spots-left' | 'last-minute' | 'high-demand'
  count?: number
  className?: string
}

export function UrgencyMessage({ type, count = 0, className = '' }: UrgencyMessageProps) {
  const getMessage = () => {
    switch (type) {
      case 'spots-left':
        return count > 0 ? `Only ${count} spots left!` : 'Fully booked'
      case 'last-minute':
        return 'Last minute availability!'
      case 'high-demand':
        return 'High demand - Book now!'
      default:
        return ''
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'spots-left':
        return <Users size={16} />
      case 'last-minute':
        return <Clock size={16} />
      case 'high-demand':
        return <AlertTriangle size={16} />
      default:
        return null
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'spots-left':
        return count > 0 
          ? 'bg-orange-100 text-orange-800 border-orange-200' 
          : 'bg-red-100 text-red-800 border-red-200'
      case 'last-minute':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'high-demand':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (type === 'spots-left' && count === 0) {
    return null // Don't show "Fully booked" messages
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getStyles()} ${className}`}
    >
      {getIcon()}
      <span>{getMessage()}</span>
    </motion.div>
  )
}

interface LiveBookingCountProps {
  count: number
  className?: string
}

export function LiveBookingCount({ count, className = '' }: LiveBookingCountProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 ${className}`}
    >
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>{count} people viewing this page</span>
    </motion.div>
  )
}

interface TrustBadgeProps {
  type: 'secure' | 'verified' | 'guarantee'
  className?: string
}

export function TrustBadge({ type, className = '' }: TrustBadgeProps) {
  const getContent = () => {
    switch (type) {
      case 'secure':
        return {
          icon: '🔒',
          text: 'Secure Payment',
          description: 'SSL encrypted checkout'
        }
      case 'verified':
        return {
          icon: '✅',
          text: 'Verified Property',
          description: 'Authentic reviews'
        }
      case 'guarantee':
        return {
          icon: '🛡️',
          text: 'Best Price Guarantee',
          description: 'Price match promise'
        }
      default:
        return { icon: '', text: '', description: '' }
    }
  }

  const { icon, text, description } = getContent()

  return (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-gray-900 text-sm">{text}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  )
}

interface SocialProofProps {
  reviews: number
  rating: number
  className?: string
}

export function SocialProof({ reviews, rating, className = '' }: SocialProofProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-semibold">{rating}</span> based on{' '}
        <span className="font-semibold">{reviews.toLocaleString()}</span> reviews
      </div>
    </div>
  )
}
