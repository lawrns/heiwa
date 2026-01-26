/**
 * Step Skeleton Components for Booking Widget
 * Airbnb-quality loading placeholders for each booking step
 * 
 * Requirements: 3.2, 7.1
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonButton, SkeletonInput } from '@/components/ui/skeleton'

interface StepSkeletonProps {
  className?: string
}

/**
 * Base shimmer line component
 */
function ShimmerLine({ 
  width = '100%', 
  height = 16,
  className 
}: { 
  width?: string | number
  height?: number
  className?: string 
}) {
  return (
    <Skeleton 
      width={width} 
      height={height} 
      className={cn('rounded', className)} 
    />
  )
}

/**
 * Experience Selection Step Skeleton
 * Shows placeholder for experience type cards
 */
export function ExperienceSelectionSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="60%" height={28} />
        <ShimmerLine width="80%" height={16} />
      </div>

      {/* Experience Cards */}
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 p-6 space-y-4"
          >
            <div className="flex items-start gap-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1 space-y-2">
                <ShimmerLine width="40%" height={20} />
                <ShimmerLine width="70%" height={14} />
              </div>
              <ShimmerLine width={80} height={24} />
            </div>
            <ShimmerLine width="90%" height={14} />
            <ShimmerLine width="60%" height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Options Selection Step Skeleton
 * Shows placeholder for date picker and guest selector
 */
export function OptionsSelectionSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="50%" height={28} />
        <ShimmerLine width="70%" height={16} />
      </div>

      {/* Date Picker Placeholder */}
      <div className="space-y-3">
        <ShimmerLine width="30%" height={14} />
        <div className="rounded-xl border border-gray-200 p-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <ShimmerLine key={i} width="100%" height={12} />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton 
                key={i} 
                width={36} 
                height={36} 
                className="rounded-lg" 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guest Selector Placeholder */}
      <div className="space-y-3">
        <ShimmerLine width="25%" height={14} />
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
          <ShimmerLine width="40%" height={16} />
          <div className="flex items-center gap-3">
            <Skeleton width={36} height={36} className="rounded-lg" />
            <ShimmerLine width={24} height={20} />
            <Skeleton width={36} height={36} className="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Room Selection Step Skeleton
 * Shows placeholder for room cards
 */
export function RoomSelectionSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="45%" height={28} />
        <ShimmerLine width="65%" height={16} />
      </div>

      {/* Room Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Room Image */}
            <Skeleton height={180} className="w-full" />
            
            {/* Room Details */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <ShimmerLine width="50%" height={20} />
                  <ShimmerLine width="70%" height={14} />
                </div>
                <ShimmerLine width={80} height={24} />
              </div>
              
              {/* Amenities */}
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} width={60} height={24} className="rounded-full" />
                ))}
              </div>
              
              <SkeletonButton size="lg" className="w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Add-ons Selection Step Skeleton
 * Shows placeholder for add-on options
 */
export function AddOnsSelectionSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="40%" height={28} />
        <ShimmerLine width="60%" height={16} />
      </div>

      {/* Add-on Cards */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200"
          >
            <Skeleton width={24} height={24} className="rounded" />
            <div className="flex-1 space-y-2">
              <ShimmerLine width="45%" height={18} />
              <ShimmerLine width="70%" height={14} />
            </div>
            <ShimmerLine width={60} height={20} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Guest Details Step Skeleton
 * Shows placeholder for guest information form
 */
export function GuestDetailsSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="35%" height={28} />
        <ShimmerLine width="55%" height={16} />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <ShimmerLine width="40%" height={14} />
            <SkeletonInput />
          </div>
          <div className="space-y-2">
            <ShimmerLine width="40%" height={14} />
            <SkeletonInput />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <ShimmerLine width="25%" height={14} />
          <SkeletonInput />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <ShimmerLine width="30%" height={14} />
          <SkeletonInput />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <ShimmerLine width="20%" height={14} />
          <SkeletonInput />
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <ShimmerLine width="35%" height={14} />
          <Skeleton height={100} className="w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  )
}

/**
 * Review and Pay Step Skeleton
 * Shows placeholder for booking summary and payment
 */
export function ReviewAndPaySkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      {/* Header */}
      <div className="space-y-2">
        <ShimmerLine width="50%" height={28} />
        <ShimmerLine width="70%" height={16} />
      </div>

      {/* Booking Summary Card */}
      <div className="rounded-xl border border-gray-200 p-6 space-y-4">
        <ShimmerLine width="35%" height={20} />
        
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <ShimmerLine width="40%" height={16} />
              <ShimmerLine width="25%" height={16} />
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <ShimmerLine width="20%" height={20} />
            <ShimmerLine width="30%" height={24} />
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <ShimmerLine width="35%" height={18} />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200"
            >
              <Skeleton width={20} height={20} className="rounded-full" />
              <div className="flex-1 space-y-1">
                <ShimmerLine width="30%" height={16} />
                <ShimmerLine width="50%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3">
        <Skeleton width={20} height={20} className="rounded mt-0.5" />
        <div className="flex-1 space-y-1">
          <ShimmerLine width="90%" height={14} />
          <ShimmerLine width="60%" height={14} />
        </div>
      </div>

      {/* Submit Button */}
      <SkeletonButton size="lg" className="w-full h-12" />
    </div>
  )
}

/**
 * Generic Step Skeleton
 * Fallback skeleton for unknown step types
 */
export function GenericStepSkeleton({ className }: StepSkeletonProps) {
  return (
    <div className={cn('space-y-6 animate-fade-in-up', className)}>
      <div className="space-y-2">
        <ShimmerLine width="50%" height={28} />
        <ShimmerLine width="70%" height={16} />
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-4 space-y-3">
            <ShimmerLine width="60%" height={18} />
            <ShimmerLine width="80%" height={14} />
            <ShimmerLine width="40%" height={14} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Step Skeleton Wrapper
 * Renders the appropriate skeleton based on step type
 */
export function StepSkeleton({ 
  stepType,
  className 
}: { 
  stepType: string
  className?: string 
}) {
  switch (stepType) {
    case 'experience':
      return <ExperienceSelectionSkeleton className={className} />
    case 'options':
      return <OptionsSelectionSkeleton className={className} />
    case 'room-assignment':
    case 'surf-week-room-selection':
      return <RoomSelectionSkeleton className={className} />
    case 'add-ons':
      return <AddOnsSelectionSkeleton className={className} />
    case 'guest-details':
      return <GuestDetailsSkeleton className={className} />
    case 'review-pay':
      return <ReviewAndPaySkeleton className={className} />
    default:
      return <GenericStepSkeleton className={className} />
  }
}

export default StepSkeleton
