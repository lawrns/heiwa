import { Page, expect } from '@playwright/test'
import { TestBookingData } from '../fixtures/test-data'

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'

/**
 * Fill booking widget form
 */
export async function fillBookingWidget(page: Page, bookingData: TestBookingData): Promise<void> {
  // Navigate to homepage
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  
  // Open booking widget (click BOOK button)
  const bookButton = page.locator('button:has-text("BOOK"), button:has-text("Book Now"), [data-testid="book-button"]')
  if (await bookButton.count() > 0) {
    await bookButton.first().click()
    await page.waitForTimeout(1000)
  }
  
  // Select experience type
  if (bookingData.experienceType === 'room') {
    const roomOption = page.locator('button:has-text("Room"), [data-testid="experience-room"], label:has-text("Room")')
    if (await roomOption.count() > 0) {
      await roomOption.first().click()
      await page.waitForTimeout(500)
    }
  } else if (bookingData.experienceType === 'surf-week') {
    const surfWeekOption = page.locator('button:has-text("Surf Week"), [data-testid="experience-surf-week"], label:has-text("Surf Week")')
    if (await surfWeekOption.count() > 0) {
      await surfWeekOption.first().click()
      await page.waitForTimeout(500)
    }
  }
  
  // Select dates
  const checkInInput = page.locator('input[name="checkIn"], input[placeholder*="Check-in"], [data-testid="check-in"]')
  if (await checkInInput.count() > 0) {
    await checkInInput.first().fill(bookingData.checkIn)
    await page.waitForTimeout(500)
  }
  
  const checkOutInput = page.locator('input[name="checkOut"], input[placeholder*="Check-out"], [data-testid="check-out"]')
  if (await checkOutInput.count() > 0) {
    await checkOutInput.first().fill(bookingData.checkOut)
    await page.waitForTimeout(500)
  }
  
  // Select room or surf week option
  if (bookingData.experienceType === 'room' && bookingData.roomId) {
    const roomSelect = page.locator(`[data-testid="room-${bookingData.roomId}"], button:has-text("${bookingData.roomId}")`)
    if (await roomSelect.count() > 0) {
      await roomSelect.first().click()
      await page.waitForTimeout(500)
    }
  } else if (bookingData.experienceType === 'surf-week' && bookingData.surfWeekId) {
    const surfWeekSelect = page.locator(`[data-testid="surf-week-${bookingData.surfWeekId}"], button:has-text("${bookingData.surfWeekId}")`)
    if (await surfWeekSelect.count() > 0) {
      await surfWeekSelect.first().click()
      await page.waitForTimeout(500)
    }
  }
  
  // Add guest details
  const guestNameInput = page.locator('input[name="firstName"], input[placeholder*="First Name"], [data-testid="guest-first-name"]')
  if (await guestNameInput.count() > 0) {
    const nameParts = bookingData.guestName.split(' ')
    await guestNameInput.first().fill(nameParts[0] || bookingData.guestName)
    await page.waitForTimeout(300)
  }
  
  const guestLastNameInput = page.locator('input[name="lastName"], input[placeholder*="Last Name"], [data-testid="guest-last-name"]')
  if (await guestLastNameInput.count() > 0) {
    const nameParts = bookingData.guestName.split(' ')
    await guestLastNameInput.first().fill(nameParts.slice(1).join(' ') || '')
    await page.waitForTimeout(300)
  }
  
  const guestEmailInput = page.locator('input[name="email"], input[type="email"], input[placeholder*="Email"], [data-testid="guest-email"]')
  if (await guestEmailInput.count() > 0) {
    await guestEmailInput.first().fill(bookingData.guestEmail)
    await page.waitForTimeout(300)
  }
  
  const guestPhoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="Phone"], [data-testid="guest-phone"]')
  if (await guestPhoneInput.count() > 0) {
    await guestPhoneInput.first().fill(bookingData.guestPhone)
    await page.waitForTimeout(300)
  }
  
  // Set number of guests
  const guestsInput = page.locator('input[name="guests"], input[type="number"], [data-testid="guests"]')
  if (await guestsInput.count() > 0) {
    await guestsInput.first().fill(bookingData.guests.toString())
    await page.waitForTimeout(300)
  }
  
  // Continue to next step
  const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), [data-testid="continue"]')
  if (await continueButton.count() > 0) {
    await continueButton.first().click()
    await page.waitForTimeout(1000)
  }
}

/**
 * Select bank transfer payment method
 */
export async function selectBankTransferPayment(page: Page): Promise<void> {
  // Look for payment method selector
  const bankTransferOption = page.locator(
    'input[value="bank_wire"], input[value="bank-transfer"], ' +
    'label:has-text("Bank Transfer"), label:has-text("Bank Wire"), ' +
    '[data-testid="payment-bank-wire"], button:has-text("Bank Transfer")'
  )
  
  if (await bankTransferOption.count() > 0) {
    await bankTransferOption.first().click()
    await page.waitForTimeout(500)
  } else {
    // Try radio button
    const radioButton = page.locator('input[type="radio"][value*="bank"], input[type="radio"][value*="wire"]')
    if (await radioButton.count() > 0) {
      await radioButton.first().click()
      await page.waitForTimeout(500)
    }
  }
}

/**
 * Submit booking
 */
export async function submitBooking(page: Page): Promise<void> {
  // Find submit button
  const submitButton = page.locator(
    'button[type="submit"]:has-text("Book"), ' +
    'button[type="submit"]:has-text("Confirm"), ' +
    'button:has-text("Complete Booking"), ' +
    '[data-testid="submit-booking"], ' +
    'button:has-text("Pay")'
  )
  
  if (await submitButton.count() > 0) {
    await submitButton.first().click()
    await page.waitForTimeout(2000)
  }
}

/**
 * Verify booking confirmation page
 */
export async function verifyBookingConfirmation(page: Page): Promise<boolean> {
  // Wait for confirmation page to load
  await page.waitForLoadState('networkidle')
  
  // Check for confirmation indicators
  const confirmationIndicators = [
    'booking confirmed',
    'confirmation',
    'success',
    'thank you',
    'booking number',
  ]
  
  const pageContent = await page.textContent('body') || ''
  const pageTitle = await page.title()
  
  for (const indicator of confirmationIndicators) {
    if (pageContent.toLowerCase().includes(indicator) || pageTitle.toLowerCase().includes(indicator)) {
      return true
    }
  }
  
  // Check for success message element
  const successMessage = page.locator('[data-testid="success"], .success, [role="alert"]:has-text("success")')
  if (await successMessage.count() > 0) {
    return true
  }
  
  return false
}

/**
 * Verify bank transfer instructions are displayed
 */
export async function verifyBankTransferInstructions(page: Page): Promise<boolean> {
  const bankTransferKeywords = [
    'bank transfer',
    'wire transfer',
    'bank details',
    'iban',
    'swift',
    'account number',
    'transfer instructions',
  ]
  
  const pageContent = await page.textContent('body') || ''
  
  for (const keyword of bankTransferKeywords) {
    if (pageContent.toLowerCase().includes(keyword)) {
      return true
    }
  }
  
  return false
}

/**
 * Extract booking ID from confirmation page
 */
export async function getBookingIdFromConfirmation(page: Page): Promise<string | null> {
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Try to extract from page content
  const pageContent = await page.textContent('body') || ''
  
  // Look for UUID pattern
  const uuidMatch = pageContent.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
  if (uuidMatch) {
    return uuidMatch[1]
  }
  
  // Look for booking number pattern
  const bookingNumberMatch = pageContent.match(/booking[_\s]?(?:number|id|#)[:\s]+([a-z0-9-]+)/i)
  if (bookingNumberMatch) {
    return bookingNumberMatch[1]
  }
  
  // Try to get from data attribute
  const bookingIdElement = page.locator('[data-booking-id], [data-testid="booking-id"]')
  if (await bookingIdElement.count() > 0) {
    const id = await bookingIdElement.first().getAttribute('data-booking-id') || 
               await bookingIdElement.first().getAttribute('data-testid')
    if (id) return id
  }
  
  // Try to get from text content
  const bookingIdText = page.locator('text=/booking[_\s]?(?:number|id|#)[:\s]+([a-z0-9-]+)/i')
  if (await bookingIdText.count() > 0) {
    const text = await bookingIdText.first().textContent()
    const match = text?.match(/([a-z0-9-]+)/i)
    if (match) return match[1]
  }
  
  return null
}

/**
 * Complete full booking flow with bank transfer
 */
export async function completeBankTransferBooking(page: Page, bookingData: TestBookingData): Promise<{
  bookingId: string | null
  success: boolean
  error?: string
}> {
  try {
    // Fill booking form
    await fillBookingWidget(page, bookingData)
    
    // Select bank transfer payment
    await selectBankTransferPayment(page)
    
    // Submit booking
    await submitBooking(page)
    
    // Verify confirmation
    const isConfirmed = await verifyBookingConfirmation(page)
    if (!isConfirmed) {
      return {
        bookingId: null,
        success: false,
        error: 'Booking confirmation not found',
      }
    }
    
    // Verify bank transfer instructions
    const hasInstructions = await verifyBankTransferInstructions(page)
    if (!hasInstructions) {
      return {
        bookingId: null,
        success: false,
        error: 'Bank transfer instructions not found',
      }
    }
    
    // Extract booking ID
    const bookingId = await getBookingIdFromConfirmation(page)
    
    return {
      bookingId,
      success: true,
    }
  } catch (error: any) {
    return {
      bookingId: null,
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}


