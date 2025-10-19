'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular' | 'card'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

const shimmerVariants = {
  wave: {
    x: ['-100%', '100%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 1.5,
        ease: 'linear',
      },
    },
  },
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height, 
  animation = 'wave' 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 relative overflow-hidden'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    card: 'rounded-lg h-48',
  }

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {animation === 'wave' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          animate="wave"
        />
      )}
      {animation === 'pulse' && (
        <motion.div
          className="absolute inset-0 bg-gray-300"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

// Specific skeleton components for common use cases
export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="p-6 space-y-3">
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="70%" height={14} />
      </div>
    </div>
  )
}

export function ReviewCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="space-y-1">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={12} />
        </div>
      </div>
      <div className="flex space-x-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={16} height={16} />
        ))}
      </div>
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="80%" height={14} className="mb-2" />
      <Skeleton variant="text" width={60} height={14} />
    </div>
  )
}

export function ActivityCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <Skeleton variant="text" width="70%" height={28} className="bg-white/20" />
      </div>
    </div>
  )
}

export function FeatureCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg shadow-lg">
      <Skeleton variant="rectangular" height={300} className="w-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton variant="rectangular" width={120} height={40} className="rounded-lg" />
      </div>
      <div className="p-6 bg-white">
        <Skeleton variant="text" width="80%" height={24} className="mb-2" />
        <Skeleton variant="text" width="100%" height={14} className="mb-1" />
        <Skeleton variant="text" width="90%" height={14} className="mb-1" />
        <Skeleton variant="text" width="70%" height={14} />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Skeleton variant="rectangular" height="100%" className="w-full" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
          <Skeleton variant="text" width="80%" height={64} className="mx-auto" />
          <Skeleton variant="text" width="60%" height={32} className="mx-auto" />
          <Skeleton variant="rectangular" width={200} height={48} className="mx-auto rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function NavigationSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Skeleton variant="rectangular" width={120} height={40} />
          <div className="hidden lg:flex items-center space-x-8">
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={100} height={16} />
          </div>
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>
      </div>
    </nav>
  )
}
