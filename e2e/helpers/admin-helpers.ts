import { Page, expect } from '@playwright/test'
import { loginAsAdmin, setAdminCookie } from '../fixtures/admin-auth'

const BASE_URL = process.env.BASE_URL || 'https://heiwahauz.netlify.app'

/**
 * Navigate to admin page
 */
export async function navigateToAdminPage(page: Page, path: string = ''): Promise<void> {
  // Some routes are under /admin/, others are direct (like /activities, /add-ons, /analytics)
  let url: string
  if (path.startsWith('/')) {
    url = `${BASE_URL}${path}`
  } else if (path === '') {
    url = `${BASE_URL}/admin`
  } else {
    // Try /admin/ first, but also support direct routes
    url = `${BASE_URL}/admin/${path}`
  }
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(1000) // Give page time to load
  
  // If we got redirected or 404, try without /admin/ prefix
  const currentUrl = page.url()
  if (currentUrl.includes('404') || currentUrl === url) {
    // Try direct route without /admin/
    const directUrl = path.startsWith('/') ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`
    if (directUrl !== url) {
      await page.goto(directUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForTimeout(1000)
    }
  }
}

/**
 * Wait for admin page to be fully loaded
 */
export async function waitForAdminPageLoad(page: Page): Promise<void> {
  // Wait for page to be in DOM
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 })
  
  // Wait for navigation sidebar or main content (more flexible)
  try {
    await Promise.race([
      page.waitForSelector('aside, nav, [data-testid="admin-sidebar"]', { timeout: 5000 }).catch(() => null),
      page.waitForSelector('main, [data-testid="admin-content"], body', { timeout: 5000 }).catch(() => null),
      page.waitForTimeout(2000) // Fallback timeout
    ])
  } catch {
    // Continue even if selectors don't match - page might still be valid
  }
  
  // Wait a bit for any async content
  await page.waitForTimeout(1000)
}

/**
 * Ensure admin is authenticated
 */
export async function ensureAdminAuth(page: Page): Promise<void> {
  const currentUrl = page.url()
  
  // Check if we're on login page
  if (currentUrl.includes('/admin/login')) {
    await loginAsAdmin(page)
  } else {
    // Try to set cookie if not authenticated
    try {
      await setAdminCookie(page)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(2000)
      
      // If still on login, do full login
      if (page.url().includes('/admin/login')) {
        await loginAsAdmin(page)
      }
    } catch {
      await loginAsAdmin(page)
    }
  }
}

/**
 * Create a test booking from admin panel
 */
export async function createTestBooking(page: Page, bookingData: {
  guestName: string
  guestEmail: string
  guestPhone: string
  experienceType: 'room' | 'surf_camp'
  checkIn: string
  checkOut: string
  guests: number
  notes?: string
}): Promise<string | null> {
  await ensureAdminAuth(page)
  await navigateToAdminPage(page, '/bookings')
  await waitForAdminPageLoad(page)
  
  // Click create booking button
  const createButton = page.locator('button:has-text("Create"), button:has-text("New"), [data-testid="create-booking-btn"]')
  if (await createButton.count() > 0) {
    await createButton.first().click()
    await page.waitForTimeout(1000)
  }
  
  // Fill booking form
  const nameInput = page.locator('input[name="guest_name"], input[name="name"], [data-testid="booking-guest-name"]')
  if (await nameInput.count() > 0) {
    await nameInput.first().fill(bookingData.guestName)
  }
  
  const emailInput = page.locator('input[name="email"], input[type="email"], [data-testid="booking-email"]')
  if (await emailInput.count() > 0) {
    await emailInput.first().fill(bookingData.guestEmail)
  }
  
  const phoneInput = page.locator('input[name="phone"], input[type="tel"], [data-testid="booking-phone"]')
  if (await phoneInput.count() > 0) {
    await phoneInput.first().fill(bookingData.guestPhone)
  }
  
  // Submit form
  const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")')
  if (await submitButton.count() > 0) {
    await submitButton.first().click()
    await page.waitForTimeout(2000)
  }
  
  // Try to extract booking ID from success message or URL
  const successMessage = page.locator('[data-testid="success"], .success, [role="alert"]')
  if (await successMessage.count() > 0) {
    const text = await successMessage.first().textContent()
    const idMatch = text?.match(/booking[_\s]?id[:\s]+([a-f0-9-]+)/i) || text?.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i)
    if (idMatch) {
      return idMatch[1]
    }
  }
  
  return null
}

/**
 * Verify booking exists in admin panel
 */
export async function verifyBookingInAdmin(page: Page, bookingId: string, guestName?: string): Promise<boolean> {
  await ensureAdminAuth(page)
  await navigateToAdminPage(page, '/bookings')
  await waitForAdminPageLoad(page)
  
  // Search for booking
  if (guestName) {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], [data-testid="search"]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill(guestName)
      await page.waitForTimeout(1000)
    }
  }
  
  // Check if booking appears in table
  const bookingRow = page.locator(`tr:has-text("${bookingId}"), tr:has-text("${guestName || ''}")`)
  return await bookingRow.count() > 0
}

/**
 * Get booking details from admin panel
 */
export async function getBookingDetails(page: Page, bookingId: string): Promise<Record<string, string> | null> {
  await ensureAdminAuth(page)
  await navigateToAdminPage(page, `/bookings`)
  await waitForAdminPageLoad(page)
  
  // Search for booking
  const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
  if (await searchInput.count() > 0) {
    await searchInput.first().fill(bookingId)
    await page.waitForTimeout(1000)
  }
  
  // Click on booking row to view details
  const bookingRow = page.locator(`tr:has-text("${bookingId}")`)
  if (await bookingRow.count() > 0) {
    await bookingRow.first().click()
    await page.waitForTimeout(1000)
    
    // Extract details from modal or detail page
    const details: Record<string, string> = {}
    
    // Try to get common fields
    const nameElement = page.locator('[data-testid="guest-name"], .guest-name')
    if (await nameElement.count() > 0) {
      details.name = await nameElement.first().textContent() || ''
    }
    
    const emailElement = page.locator('[data-testid="guest-email"], .guest-email')
    if (await emailElement.count() > 0) {
      details.email = await emailElement.first().textContent() || ''
    }
    
    const statusElement = page.locator('[data-testid="status"], .status')
    if (await statusElement.count() > 0) {
      details.status = await statusElement.first().textContent() || ''
    }
    
    const paymentStatusElement = page.locator('[data-testid="payment-status"], .payment-status')
    if (await paymentStatusElement.count() > 0) {
      details.paymentStatus = await paymentStatusElement.first().textContent() || ''
    }
    
    return details
  }
  
  return null
}

/**
 * Cleanup test data (bookings, clients, etc.)
 */
export async function cleanupTestData(page: Page, bookingIds: string[]): Promise<void> {
  await ensureAdminAuth(page)
  await navigateToAdminPage(page, '/bookings')
  await waitForAdminPageLoad(page)
  
  for (const bookingId of bookingIds) {
    try {
      // Search for booking
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
      if (await searchInput.count() > 0) {
        await searchInput.first().fill(bookingId)
        await page.waitForTimeout(1000)
      }
      
      // Find and click delete button
      const deleteButton = page.locator(`tr:has-text("${bookingId}") button:has-text("Delete"), tr:has-text("${bookingId}") [data-testid="delete"]`)
      if (await deleteButton.count() > 0) {
        await deleteButton.first().click()
        await page.waitForTimeout(500)
        
        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), [data-testid="confirm-delete"]')
        if (await confirmButton.count() > 0) {
          await confirmButton.first().click()
          await page.waitForTimeout(1000)
        }
      }
    } catch (error) {
      console.warn(`Failed to cleanup booking ${bookingId}:`, error)
    }
  }
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp, timeout: number = 10000): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url()
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern)
      }
      return urlPattern.test(url)
    },
    { timeout }
  )
}

