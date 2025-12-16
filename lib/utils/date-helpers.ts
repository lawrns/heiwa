/**
 * Date helper utilities
 * Handles conversion between Date objects and strings (for localStorage, API calls, etc.)
 */

/**
 * Ensures a value is a Date object, converting from string if needed
 * Returns null if the value is null/undefined or cannot be parsed
 */
export function ensureDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null
  if (date instanceof Date) {
    // Validate the Date object is valid
    return isNaN(date.getTime()) ? null : date
  }
  // Try to parse as string
  const parsed = new Date(date)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Converts a date to ISO string format (YYYY-MM-DD) for API calls
 */
export function dateToISOString(date: Date | string | null | undefined): string {
  const dateObj = ensureDate(date)
  if (!dateObj) return ''
  return dateObj.toISOString().split('T')[0]
}

/**
 * Converts a date to full ISO string for logging/debugging
 */
export function dateToFullISOString(date: Date | string | null | undefined): string | undefined {
  const dateObj = ensureDate(date)
  if (!dateObj) return undefined
  return dateObj.toISOString()
}

