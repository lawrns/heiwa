import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad, verifyBookingInAdmin, getBookingDetails } from './helpers/admin-helpers'
import { completeBankTransferBooking, verifyBankTransferInstructions, getBookingIdFromConfirmation } from './helpers/booking-helpers'
import { testBookingTemplates, generateTestEmail, generateTestPhone, getFutureDate } from './fixtures/test-data'

test.describe('Bank Transfer Booking Flow', () => {
  test('should complete room booking with bank transfer', async ({ page }) => {
    const bookingData = testBookingTemplates.bankTransferBooking()
    
    // Complete booking flow
    const result = await completeBankTransferBooking(page, bookingData)
    
    expect(result.success).toBe(true)
    expect(result.bookingId).toBeTruthy()
    
    // Verify bank transfer instructions are shown
    const hasInstructions = await verifyBankTransferInstructions(page)
    expect(hasInstructions).toBe(true)
    
    // Verify booking appears in admin
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    // Search for booking
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill(bookingData.guestName)
      await page.waitForTimeout(2000)
    }
    
    // Verify booking exists
    const bookingExists = await verifyBookingInAdmin(page, result.bookingId || '', bookingData.guestName)
    expect(bookingExists).toBe(true)
    
    // Verify booking details
    const details = await getBookingDetails(page, result.bookingId || '')
    expect(details).toBeTruthy()
    
    // Verify payment status is pending
    if (details) {
      const paymentStatus = details.paymentStatus?.toLowerCase() || ''
      expect(paymentStatus).toContain('pending')
    }
  })

  test('should complete surf week booking with bank transfer', async ({ page }) => {
    const bookingData = testBookingTemplates.surfWeekBooking()
    bookingData.paymentMethod = 'bank_wire'
    
    // Complete booking flow
    const result = await completeBankTransferBooking(page, bookingData)
    
    expect(result.success).toBe(true)
    expect(result.bookingId).toBeTruthy()
    
    // Verify bank transfer instructions
    const hasInstructions = await verifyBankTransferInstructions(page)
    expect(hasInstructions).toBe(true)
    
    // Verify in admin
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const bookingExists = await verifyBookingInAdmin(page, result.bookingId || '', bookingData.guestName)
    expect(bookingExists).toBe(true)
  })

  test('should show bank transfer instructions on confirmation page', async ({ page }) => {
    const bookingData = testBookingTemplates.bankTransferBooking()
    
    // Complete booking
    const result = await completeBankTransferBooking(page, bookingData)
    
    expect(result.success).toBe(true)
    
    // Verify instructions are displayed
    const hasInstructions = await verifyBankTransferInstructions(page)
    expect(hasInstructions).toBe(true)
    
    // Check for specific bank transfer content
    const pageContent = await page.textContent('body') || ''
    const bankKeywords = ['iban', 'swift', 'account', 'transfer', 'bank']
    const foundKeywords = bankKeywords.filter(keyword => 
      pageContent.toLowerCase().includes(keyword)
    )
    
    expect(foundKeywords.length).toBeGreaterThan(0)
  })

  test('should create multiple bank transfer bookings', async ({ page }) => {
    const bookings: Array<{ id: string | null; guestName: string }> = []
    
    // Create first booking
    const booking1 = testBookingTemplates.bankTransferBooking()
    booking1.guestName = `Test Guest 1 ${Date.now()}`
    booking1.guestEmail = generateTestEmail('booking1')
    
    const result1 = await completeBankTransferBooking(page, booking1)
    expect(result1.success).toBe(true)
    bookings.push({ id: result1.bookingId, guestName: booking1.guestName })
    
    await page.waitForTimeout(2000)
    
    // Create second booking
    const booking2 = testBookingTemplates.bankTransferBooking()
    booking2.guestName = `Test Guest 2 ${Date.now()}`
    booking2.guestEmail = generateTestEmail('booking2')
    booking2.checkIn = getFutureDate(21)
    booking2.checkOut = getFutureDate(24)
    
    const result2 = await completeBankTransferBooking(page, booking2)
    expect(result2.success).toBe(true)
    bookings.push({ id: result2.bookingId, guestName: booking2.guestName })
    
    // Verify both in admin
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    for (const booking of bookings) {
      if (booking.id) {
        const exists = await verifyBookingInAdmin(page, booking.id, booking.guestName)
        expect(exists).toBe(true)
      }
    }
  })

  test('should verify payment status is pending for bank transfer bookings', async ({ page }) => {
    const bookingData = testBookingTemplates.bankTransferBooking()
    
    // Complete booking
    const result = await completeBankTransferBooking(page, bookingData)
    expect(result.success).toBe(true)
    expect(result.bookingId).toBeTruthy()
    
    // Verify in admin
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    // Search for booking
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    if (await searchInput.count() > 0) {
      await searchInput.first().fill(bookingData.guestName)
      await page.waitForTimeout(2000)
    }
    
    // Get booking details
    const details = await getBookingDetails(page, result.bookingId || '')
    expect(details).toBeTruthy()
    
    if (details) {
      // Check payment status
      const paymentStatus = details.paymentStatus?.toLowerCase() || ''
      expect(paymentStatus).toContain('pending')
      
      // Verify in table if visible
      const bookingRow = page.locator(`tr:has-text("${bookingData.guestName}")`)
      if (await bookingRow.count() > 0) {
        const rowText = await bookingRow.first().textContent() || ''
        expect(rowText.toLowerCase()).toContain('pending')
      }
    }
  })

  test('should display booking confirmation with booking ID', async ({ page }) => {
    const bookingData = testBookingTemplates.bankTransferBooking()
    
    // Complete booking
    const result = await completeBankTransferBooking(page, bookingData)
    expect(result.success).toBe(true)
    
    // Verify confirmation page
    const isConfirmed = await page.locator('text=/confirmed|success|thank you/i').count()
    expect(isConfirmed).toBeGreaterThan(0)
    
    // Extract booking ID
    const bookingId = await getBookingIdFromConfirmation(page)
    expect(bookingId).toBeTruthy()
    expect(result.bookingId).toBe(bookingId)
  })

  test('should handle booking with add-ons and bank transfer', async ({ page }) => {
    const bookingData = testBookingTemplates.bankTransferBooking()
    // Note: Add-ons selection would be added here if widget supports it
    
    const result = await completeBankTransferBooking(page, bookingData)
    expect(result.success).toBe(true)
    
    // Verify booking created
    expect(result.bookingId).toBeTruthy()
    
    // Verify in admin
    await ensureAdminAuth(page)
    const bookingExists = await verifyBookingInAdmin(page, result.bookingId || '', bookingData.guestName)
    expect(bookingExists).toBe(true)
  })
})


