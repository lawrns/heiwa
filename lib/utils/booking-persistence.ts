/**
 * Booking Progress Persistence Utilities
 * 
 * Saves and restores booking widget state to/from localStorage
 * to allow users to resume their booking if they navigate away
 */

import { BookingState } from '@/components/BookingWidget/types'

const STORAGE_KEY = 'heiwa_booking_progress'
const STORAGE_VERSION = 1 // Increment when state structure changes
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

interface StoredBookingState {
  version: number
  timestamp: number
  state: Partial<BookingState>
}

/**
 * Save booking state to localStorage
 */
export function saveBookingProgress(state: BookingState): void {
  if (typeof window === 'undefined') return

  try {
    // Convert Date objects to ISO strings for JSON serialization
    const datesToSave = state.dates ? {
      checkIn: state.dates.checkIn instanceof Date ? state.dates.checkIn.toISOString() : state.dates.checkIn,
      checkOut: state.dates.checkOut instanceof Date ? state.dates.checkOut.toISOString() : state.dates.checkOut,
    } : state.dates

    const stored: StoredBookingState = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      state: {
        currentStep: state.currentStep,
        experienceType: state.experienceType,
        dates: datesToSave,
        guests: state.guests,
        participantNames: state.participantNames,
        selectedOption: state.selectedOption,
        selectedSurfWeek: state.selectedSurfWeek,
        selectedSurfWeekRoom: state.selectedSurfWeekRoom,
        roomAssignments: state.roomAssignments,
        selectedAddOns: state.selectedAddOns,
        paymentMethod: state.paymentMethod,
        bankWireDetails: state.bankWireDetails,
        guestDetails: state.guestDetails,
        pricing: state.pricing,
        skippedSteps: state.skippedSteps,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.warn('Failed to save booking progress to localStorage:', error)
  }
}

/**
 * Load booking state from localStorage
 */
export function loadBookingProgress(): Partial<BookingState> | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed: StoredBookingState = JSON.parse(stored)

    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      console.log('Booking progress version mismatch, clearing old data')
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // Check if data is too old
    const age = Date.now() - parsed.timestamp
    if (age > MAX_AGE_MS) {
      console.log('Booking progress expired, clearing old data')
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    // Convert date strings back to Date objects (JSON.parse converts dates to strings)
    const restoredState = { ...parsed.state }
    if (restoredState.dates) {
      if (restoredState.dates.checkIn && typeof restoredState.dates.checkIn === 'string') {
        restoredState.dates.checkIn = new Date(restoredState.dates.checkIn)
      }
      if (restoredState.dates.checkOut && typeof restoredState.dates.checkOut === 'string') {
        restoredState.dates.checkOut = new Date(restoredState.dates.checkOut)
      }
    }

    return restoredState
  } catch (error) {
    console.warn('Failed to load booking progress from localStorage:', error)
    return null
  }
}

/**
 * Clear booking progress from localStorage
 */
export function clearBookingProgress(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear booking progress from localStorage:', error)
  }
}

/**
 * Check if booking progress exists and is valid
 */
export function hasBookingProgress(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false

    const parsed: StoredBookingState = JSON.parse(stored)
    
    // Check version and age
    if (parsed.version !== STORAGE_VERSION) return false
    const age = Date.now() - parsed.timestamp
    if (age > MAX_AGE_MS) return false

    return true
  } catch {
    return false
  }
}

