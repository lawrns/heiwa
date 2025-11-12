import { test, expect } from '@playwright/test'

test.describe('Admin Bookings Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')
  })

  test('should search bookings by guest name', async ({ page }) => {
    // Create test bookings
    const testNames = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Smith']
    
    for (const name of testNames) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', name)
      await page.fill('[data-testid="booking-email"]', `${name.toLowerCase().replace(' ', '.')}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Wait for table to load
    await page.waitForSelector('[data-testid="bookings-table"]')
    
    // Test exact name search
    await page.fill('[data-testid="search-input"]', 'John Smith')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'John Smith' })).toBeVisible()
    
    // Test partial name search
    await page.fill('[data-testid="search-input"]', 'Smith')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'John Smith' })).toBeVisible()
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Alice Smith' })).toBeVisible()
    
    // Test case insensitive search
    await page.fill('[data-testid="search-input"]', 'john')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'John Smith' })).toBeVisible()
  })

  test('should search bookings by email', async ({ page }) => {
    // Create test bookings
    const testEmails = [
      'test1@example.com',
      'user@test.com', 
      'admin@example.org',
      'booking@test.net'
    ]
    
    for (const email of testEmails) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', 'Email Test User')
      await page.fill('[data-testid="booking-email"]', email)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Test exact email search
    await page.fill('[data-testid="search-input"]', 'test1@example.com')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'test1@example.com' })).toBeVisible()
    
    // Test partial email search
    await page.fill('[data-testid="search-input"]', '@test.com')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(2)
    
    // Test domain search
    await page.fill('[data-testid="search-input"]', 'example.com')
    await page.click('[data-testid="search-btn"]')
    
    const exampleComBookings = await page.locator('[data-testid="booking-row"]').filter({ hasText: 'example.com' }).count()
    expect(exampleComBookings).toBe(2)
  })

  test('should search bookings by phone number', async ({ page }) => {
    // Create test bookings with different phone numbers
    const testPhones = [
      '+351912345678',
      '+351923456789',
      '+442012345678',
      '+33123456789'
    ]
    
    for (const phone of testPhones) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', 'Phone Test User')
      await page.fill('[data-testid="booking-email"]', `phone${testPhones.indexOf(phone)}@example.com`)
      await page.fill('[data-testid="booking-phone"]', phone)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Test exact phone search
    await page.fill('[data-testid="search-input"]', '+351912345678')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: '+351912345678' })).toBeVisible()
    
    // Test partial phone search
    await page.fill('[data-testid="search-input"]', '912345678')
    await page.click('[data-testid="search-btn"]')
    
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    
    // Test country code search
    await page.fill('[data-testid="search-input"]', '+351')
    await page.click('[data-testid="search-btn"]')
    
    const portugalBookings = await page.locator('[data-testid="booking-row"]').filter({ hasText: '+351' }).count()
    expect(portugalBookings).toBe(2)
  })

  test('should search bookings by booking ID', async ({ page }) => {
    // Create test bookings
    const bookingIds = []
    
    for (let i = 1; i <= 3; i++) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `ID Test User ${i}`)
      await page.fill('[data-testid="booking-email"]', `idtest${i}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
      
      // Get the booking ID from the table
      const bookingRow = page.locator('[data-testid="booking-row"]').filter({ hasText: `ID Test User ${i}` })
      const bookingId = await bookingRow.locator('[data-testid="booking-id"]').textContent()
      if (bookingId) bookingIds.push(bookingId.trim())
    }
    
    // Test search by full booking ID
    if (bookingIds.length > 0) {
      await page.fill('[data-testid="search-input"]', bookingIds[0])
      await page.click('[data-testid="search-btn"]')
      
      await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
      await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: bookingIds[0] })).toBeVisible()
    }
    
    // Test search by partial booking ID
    if (bookingIds.length > 0) {
      const partialId = bookingIds[0].substring(0, 6) // Assuming format like BK-12345
      await page.fill('[data-testid="search-input"]', partialId)
      await page.click('[data-testid="search-btn"]')
      
      await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    }
  })

  test('should filter bookings by experience type', async ({ page }) => {
    // Create bookings with different experience types
    const experiences = ['surf-week', 'surf-camp', 'private-lesson']
    
    for (const experience of experiences) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `${experience} Test User`)
      await page.fill('[data-testid="booking-email"]', `${experience}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click(`[data-testid="option-${experience}"]`)
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Test filter by surf-week
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    
    const surfWeekBookings = await page.locator('[data-testid="experience-surf-week"]').count()
    expect(surfWeekBookings).toBeGreaterThan(0)
    
    // Test filter by surf-camp
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-camp"]')
    
    const surfCampBookings = await page.locator('[data-testid="experience-surf-camp"]').count()
    expect(surfCampBookings).toBeGreaterThan(0)
    
    // Test multiple experience filters
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    await page.click('[data-testid="filter-surf-camp"]')
    
    const multipleBookings = await page.locator('[data-testid="booking-row"]').count()
    expect(multipleBookings).toBeGreaterThan(1)
  })

  test('should filter bookings by status', async ({ page }) => {
    // Create bookings with different statuses
    const statuses = ['pending', 'confirmed', 'cancelled']
    
    for (const status of statuses) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `${status} Test User`)
      await page.fill('[data-testid="booking-email"]', `${status}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
      
      // Edit booking to set status
      await page.locator('[data-testid="booking-row"]').filter({ hasText: `${status} Test User` }).locator('[data-testid="edit-booking-btn"]').click()
      await page.click('[data-testid="booking-status-select"]')
      await page.click(`[data-testid="status-${status}"]`)
      await page.click('[data-testid="update-booking"]')
      await page.waitForSelector('[data-testid="booking-updated-success"]')
    }
    
    // Test filter by pending
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-pending"]')
    
    const pendingBookings = await page.locator('[data-testid="status-pending"]').count()
    expect(pendingBookings).toBeGreaterThan(0)
    
    // Test filter by confirmed
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-confirmed"]')
    
    const confirmedBookings = await page.locator('[data-testid="status-confirmed"]').count()
    expect(confirmedBookings).toBeGreaterThan(0)
    
    // Test filter by cancelled
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-cancelled"]')
    
    const cancelledBookings = await page.locator('[data-testid="status-cancelled"]').count()
    expect(cancelledBookings).toBeGreaterThan(0)
  })

  test('should filter bookings by payment status', async ({ page }) => {
    // Create bookings with different payment statuses
    const paymentStatuses = ['paid', 'pending', 'refunded']
    
    for (const paymentStatus of paymentStatuses) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `Payment ${paymentStatus} User`)
      await page.fill('[data-testid="booking-email"]', `payment${paymentStatus}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
      
      // Edit booking to set payment status
      await page.locator('[data-testid="booking-row"]').filter({ hasText: `Payment ${paymentStatus} User` }).locator('[data-testid="edit-booking-btn"]').click()
      await page.click('[data-testid="payment-status-select"]')
      await page.click(`[data-testid="payment-${paymentStatus}"]`)
      await page.click('[data-testid="update-booking"]')
      await page.waitForSelector('[data-testid="booking-updated-success"]')
    }
    
    // Test filter by paid
    await page.click('[data-testid="payment-filter"]')
    await page.click('[data-testid="filter-paid"]')
    
    const paidBookings = await page.locator('[data-testid="payment-paid"]').count()
    expect(paidBookings).toBeGreaterThan(0)
    
    // Test filter by pending payment
    await page.click('[data-testid="payment-filter"]')
    await page.click('[data-testid="filter-pending"]')
    
    const pendingPayments = await page.locator('[data-testid="payment-pending"]').count()
    expect(pendingPayments).toBeGreaterThan(0)
  })

  test('should filter by date range', async ({ page }) => {
    // Create bookings for different dates
    const dates = ['2025-01-15', '2025-01-20', '2025-02-01', '2025-02-15']
    
    for (const date of dates) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `Date ${date} User`)
      await page.fill('[data-testid="booking-email"]', `date${date}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      
      // Set specific date
      await page.click('[data-testid="booking-date-picker"]')
      await page.fill('[data-testid="date-input"]', date)
      await page.click('[data-testid="confirm-date"]')
      
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Test date range filter
    await page.click('[data-testid="date-range-filter"]')
    await page.fill('[data-testid="start-date"]', '2025-01-01')
    await page.fill('[data-testid="end-date"]', '2025-01-31')
    await page.click('[data-testid="apply-date-filter"]')
    
    // Should show only January bookings
    const januaryBookings = await page.locator('[data-testid="booking-row"]').count()
    expect(januaryBookings).toBe(2)
    
    // Test February filter
    await page.fill('[data-testid="start-date"]', '2025-02-01')
    await page.fill('[data-testid="end-date"]', '2025-02-28')
    await page.click('[data-testid="apply-date-filter"]')
    
    const februaryBookings = await page.locator('[data-testid="booking-row"]').count()
    expect(februaryBookings).toBe(2)
  })

  test('should combine multiple filters', async ({ page }) => {
    // Create diverse test data
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Combined Filter User 1')
    await page.fill('[data-testid="booking-email"]', 'combined1@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Combined Filter User 2')
    await page.fill('[data-testid="booking-email"]', 'combined2@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-camp"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Combine search and filters
    await page.fill('[data-testid="search-input"]', 'Combined Filter')
    await page.click('[data-testid="search-btn"]')
    
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    
    // Should show only 1 result (surf-week + Combined Filter)
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Combined Filter User 1' })).toBeVisible()
    
    // Add status filter
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-pending"]')
    
    // Should still show 1 result if it's pending
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
  })

  test('should clear filters and reset view', async ({ page }) => {
    // Apply some filters
    await page.fill('[data-testid="search-input"]', 'test')
    await page.click('[data-testid="search-btn"]')
    
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-confirmed"]')
    
    // Clear all filters
    await page.click('[data-testid="clear-filters"]')
    
    // Verify all filters are cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('')
    await expect(page.locator('[data-testid="active-filters"]')).toHaveCount(0)
    
    // Should show all bookings again
    const allBookings = await page.locator('[data-testid="booking-row"]').count()
    expect(allBookings).toBeGreaterThan(0)
  })

  test('should save filter preferences', async ({ page }) => {
    // Apply filters
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-pending"]')
    
    // Save preferences
    await page.click('[data-testid="save-filters"]')
    await expect(page.locator('[data-testid="filters-saved"]')).toBeVisible()
    
    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Verify filters are still applied
    await expect(page.locator('[data-testid="active-filters"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="filter-surf-week-active"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-pending-active"]')).toBeVisible()
  })
})
