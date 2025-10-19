import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the number of nights between two dates
 * Uses UTC dates to avoid timezone issues
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  if (!checkIn || !checkOut || isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return 0
  }

  // Use UTC dates to avoid timezone issues
  const checkInUTC = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate())
  const checkOutUTC = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate())
  
  const timeDiff = checkOutUTC.getTime() - checkInUTC.getTime()
  const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
  
  return Math.max(0, nights)
}

/**
 * Calculate total price for a booking option
 */
export function calculateTotalPrice(option: any, nights: number): number {
  if (!option) return 0

  // For rooms, calculate based on nights
  if (option.pricePerNight !== undefined) {
    return (option.pricePerNight || 0) * nights
  }

  // For surf weeks or fixed price items
  if (option.price !== undefined) {
    return option.price || 0
  }

  return 0
}

/**
 * Format price with euro symbol
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert string to slug format
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}