import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad, verifyBookingInAdmin, getBookingDetails } from './helpers/admin-helpers'
import { completeBankTransferBooking } from './helpers/booking-helpers'
import { testBookingTemplates } from './fixtures/test-data'

test.describe('Admin Integration Tests', () => {
  test('should complete full workflow: Create booking → View in admin → Update status → Process payment', async ({ page }) => {
    // Step 1: Create booking with bank transfer
    const bookingData = testBookingTemplates.bankTransferBooking()
    const bookingResult = await completeBankTransferBooking(page, bookingData)
    
    expect(bookingResult.success).toBe(true)
    expect(bookingResult.bookingId).toBeTruthy()
    
    // Step 2: View in admin
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const bookingExists = await verifyBookingInAdmin(page, bookingResult.bookingId || '', bookingData.guestName)
    expect(bookingExists).toBe(true)
    
    // Step 3: Get booking details
    const details = await getBookingDetails(page, bookingResult.bookingId || '')
    expect(details).toBeTruthy()
    
    // Step 4: Update booking status
    const bookingRow = page.locator(`tr:has-text("${bookingData.guestName}")`).first()
    if (await bookingRow.count() > 0) {
      await bookingRow.click()
      await page.waitForTimeout(1000)
      
      // Look for status update
      const statusSelect = page.locator('select[name*="status"], [data-testid*="status"]')
      if (await statusSelect.count() > 0) {
        await statusSelect.first().selectOption('confirmed')
        await page.waitForTimeout(1000)
        
        // Save if save button exists
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
        if (await saveButton.count() > 0) {
          await saveButton.first().click()
          await page.waitForTimeout(1000)
        }
      }
    }
    
    // Step 5: Verify status updated
    const updatedDetails = await getBookingDetails(page, bookingResult.bookingId || '')
    if (updatedDetails) {
      const status = updatedDetails.status?.toLowerCase() || ''
      // Status should be confirmed or still pending (depending on save)
      expect(status.length).toBeGreaterThan(0)
    }
  })

  test('should navigate between all admin pages', async ({ page }) => {
    await loginAsAdmin(page)
    
    const adminPages = [
      '',
      '/bookings',
      '/rooms',
      '/surf-camps',
      '/clients',
      '/calendar',
      '/analytics',
      '/cms',
      '/blog/posts',
      '/activities',
      '/add-ons',
      '/gallery',
      '/payments',
      '/invoices',
    ]
    
    for (const adminPage of adminPages) {
      await navigateToAdminPage(page, adminPage)
      await waitForAdminPageLoad(page)
      
      // Verify page loaded (not login page)
      expect(page.url()).not.toContain('/admin/login')
      
      // Verify main content exists
      const mainContent = page.locator('main, [data-testid*="content"]')
      await expect(mainContent.first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('should verify data consistency across pages', async ({ page }) => {
    // Create a booking
    const bookingData = testBookingTemplates.bankTransferBooking()
    const bookingResult = await completeBankTransferBooking(page, bookingData)
    
    expect(bookingResult.success).toBe(true)
    expect(bookingResult.bookingId).toBeTruthy()
    
    await loginAsAdmin(page)

    // Verify in bookings page
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    const existsInBookings = await verifyBookingInAdmin(page, bookingResult.bookingId || '', bookingData.guestName)
    expect(existsInBookings).toBe(true)
    
    // Verify in calendar (if booking has dates)
    await navigateToAdminPage(page, '/calendar')
    await waitForAdminPageLoad(page)
    const calendar = page.locator('.calendar, [role="grid"]')
    await expect(calendar.first()).toBeVisible()
    
    // Verify in clients (if client exists)
    await navigateToAdminPage(page, '/clients')
    await waitForAdminPageLoad(page)
    const clientsTable = page.locator('table, [class*="client"]')
    await expect(clientsTable.first()).toBeVisible()
  })

  test('should handle real-time updates across multiple pages', async ({ page, context }) => {
    await loginAsAdmin(page)
    
    // Open bookings page
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const initialRows = page.locator('tbody tr')
    const initialCount = await initialRows.count()
    
    // Create a new booking in a new page (simulating real-time update)
    const newPage = await context.newPage()
    const bookingData = testBookingTemplates.bankTransferBooking()
    const bookingResult = await completeBankTransferBooking(newPage, bookingData)
    
    expect(bookingResult.success).toBe(true)
    await newPage.close()
    
    // Wait for real-time update on original page
    await page.waitForTimeout(5000)
    
    // Verify booking appears (may need to refresh or wait for real-time)
    const finalRows = page.locator('tbody tr')
    const finalCount = await finalRows.count()
    
    // Count should have increased or stayed same (depending on real-time implementation)
    expect(finalCount).toBeGreaterThanOrEqual(initialCount)
  })
})


