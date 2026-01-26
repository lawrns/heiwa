/**
 * Skeleton Loader Component
 * Airbnb-quality loading placeholders with shimmer animation
 * 
 * Requirements: 7.1, 7.5
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the skeleton
   * - text: Single line of text
   * - circular: Circle shape (avatars, icons)
   * - rectangular: Rectangle shape (images, cards)
   * - card: Full card placeholder
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  /**
   * Width of the skeleton (CSS value or number for pixels)
   */
  width?: string | number
  /**
   * Height of the skeleton (CSS value or number for pixels)
   */
  height?: string | number
  /**
   * Whether to show the shimmer animation
   */
  animate?: boolean
  /**
   * Number of lines for text variant
   */
  lines?: number
}

/**
 * Skeleton component for loading states
 * Uses shimmer animation for premium feel
 */
export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animate = true,
  lines = 1,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 rounded',
    animate && 'shimmer',
    className
  )

  const getStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = { ...style }
    
    if (width) {
      styles.width = typeof width === 'number' ? `${width}px` : width
    }
    if (height) {
      styles.height = typeof height === 'number' ? `${height}px` : height
    }
    
    return styles
  }

  // Text variant - can render multiple lines
  if (variant === 'text') {
    if (lines > 1) {
      return (
        <div className="space-y-2" {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(baseClasses, 'h-4')}
              style={{
                ...getStyles(),
                width: index === lines - 1 ? '75%' : width || '100%',
              }}
            />
          ))}
        </div>
      )
    }
    
    return (
      <div
        className={cn(baseClasses, 'h-4')}
        style={getStyles()}
        {...props}
      />
    )
  }

  // Circular variant - for avatars, icons
  if (variant === 'circular') {
    const size = width || height || 40
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{
          ...getStyles(),
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
        }}
        {...props}
      />
    )
  }

  // Card variant - full card placeholder
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-gray-200 overflow-hidden',
          className
        )}
        style={getStyles()}
        {...props}
      >
        {/* Image placeholder */}
        <div className={cn('h-48 bg-gray-200', animate && 'shimmer')} />
        {/* Content placeholder */}
        <div className="p-4 space-y-3">
          <div className={cn('h-5 bg-gray-200 rounded w-3/4', animate && 'shimmer')} />
          <div className={cn('h-4 bg-gray-200 rounded w-full', animate && 'shimmer')} />
          <div className={cn('h-4 bg-gray-200 rounded w-2/3', animate && 'shimmer')} />
        </div>
      </div>
    )
  }

  // Rectangular variant (default)
  return (
    <div
      className={baseClasses}
      style={getStyles()}
      {...props}
    />
  )
}

/**
 * Skeleton Text - Convenience component for text placeholders
 */
export function SkeletonText({
  lines = 1,
  className,
  ...props
}: Omit<SkeletonProps, 'variant'> & { lines?: number }) {
  return <Skeleton variant="text" lines={lines} className={className} {...props} />
}

/**
 * Skeleton Avatar - Convenience component for avatar placeholders
 */
export function SkeletonAvatar({
  size = 40,
  className,
  ...props
}: Omit<SkeletonProps, 'variant' | 'width' | 'height'> & { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} {...props} />
}

/**
 * Skeleton Card - Convenience component for card placeholders
 */
export function SkeletonCard({
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return <Skeleton variant="card" className={className} {...props} />
}

/**
 * Skeleton Button - Placeholder for button loading states
 */
export function SkeletonButton({
  className,
  size = 'default',
  ...props
}: Omit<SkeletonProps, 'variant'> & { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    default: 'h-10 w-24',
    lg: 'h-11 w-32',
  }
  
  return (
    <Skeleton
      className={cn('rounded-[10px]', sizeClasses[size], className)}
      {...props}
    />
  )
}

/**
 * Skeleton Input - Placeholder for input loading states
 */
export function SkeletonInput({
  className,
  ...props
}: Omit<SkeletonProps, 'variant'>) {
  return (
    <Skeleton
      className={cn('h-10 w-full rounded-[10px]', className)}
      {...props}
    />
  )
}

export default Skeleton
