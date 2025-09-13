import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '$0.00'
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

// Date formatting
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' | 'full' = 'long'
): string {
  if (!date) return 'Invalid Date'

  try {
    let dateObj: Date

    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // Handle date-only strings like '2024-03-15' by avoiding timezone conversion
      const [year, month, day] = date.split('-').map(Number)
      dateObj = new Date(year, month - 1, day)
    } else {
      dateObj = new Date(date)
    }

    if (isNaN(dateObj.getTime())) return 'Invalid Date'

    if (format === 'short') {
      return `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }

    if (format === 'full') {
      options.weekday = 'long'
      options.hour = 'numeric'
      options.minute = 'numeric'
    }

    return new Intl.DateTimeFormat('en-US', options).format(dateObj)
  } catch {
    return 'Invalid Date'
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false

  const emailRegex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)*$/
  return emailRegex.test(email.trim()) && !email.includes('..')
}

// ID generation
export function generateId(prefix: string = '', length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = prefix ? `${prefix}_` : ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return result
}

// Date calculation
export function calculateDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NaN
    }

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  } catch {
    return NaN
  }
}
