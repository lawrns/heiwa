import { test, expect } from '@playwright/test'

test.describe('Admin Bookings CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin bookings page
    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')
  })

  test('should create new booking', async ({ page }) => {
    // Click create booking button
    await page.click('[data-testid="create-booking-btn"]')
    
    // Wait for modal to open
    await expect(page.locator('[data-testid="create-booking-modal"]')).toBeVisible()
    
    // Fill booking details
    await page.fill('[data-testid="booking-guest-name"]', 'Test Guest')
    await page.fill('[data-testid="booking-email"]', 'guest@example.com')
    await page.fill('[data-testid="booking-phone"]', '+351912345678')
    
    // Select experience type
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    
    // Select dates
    await page.click('[data-testid="booking-date-picker"]')
    const availableDates = await page.locator('[data-testid="available-date"]').count()
    if (availableDates > 0) {
      await page.locator('[data-testid="available-date"]').first().click()
    }
    
    // Select room
    await page.click('[data-testid="booking-room-select"]')
    const rooms = await page.locator('[data-testid="room-option"]').count()
    if (rooms > 0) {
      await page.locator('[data-testid="room-option"]').first().click()
    }
    
    // Set number of guests
    await page.fill('[data-testid="booking-guests"]', '2')
    
    // Add notes
    await page.fill('[data-testid="booking-notes"]', 'Test booking created via admin panel')
    
    // Submit booking
    await page.click('[data-testid="save-booking"]')
    
    // Verify booking created
    await expect(page.locator('[data-testid="booking-created-success"]')).toBeVisible()
    
    // Verify booking appears in table
    await page.waitForSelector('[data-testid="bookings-table"]')
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Test Guest' })).toBeVisible()
  })

  test('should view booking details', async ({ page }) => {
    // Find existing booking or create one
    await page.waitForSelector('[data-testid="bookings-table"]')
    const bookingRows = await page.locator('[data-testid="booking-row"]').count()
    
    if (bookingRows === 0) {
      // Create a test booking first
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', 'View Test Guest')
      await page.fill('[data-testid="booking-email"]', 'view@example.com')
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Click view booking
    await page.locator('[data-testid="booking-row"]').first().click()
    
    // Wait for view modal
    await expect(page.locator('[data-testid="view-booking-modal"]')).toBeVisible()
    
    // Verify booking details are displayed
    await expect(page.locator('[data-testid="booking-id-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="guest-details-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="booking-details-display"]')).toBeVisible()
    await expect(page.locator('[data-testid="payment-status-display"]')).toBeVisible()
    
    // Verify action buttons
    await expect(page.locator('[data-testid="edit-booking-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-booking-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="send-email-btn"]')).toBeVisible()
  })

  test('should edit existing booking', async ({ page }) => {
    // Create a booking to edit
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Edit Test Guest')
    await page.fill('[data-testid="booking-email"]', 'edit@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Find and click edit booking
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Edit Test Guest' }).locator('[data-testid="edit-booking-btn"]').click()
    
    // Wait for edit modal
    await expect(page.locator('[data-testid="edit-booking-modal"]')).toBeVisible()
    
    // Modify booking details
    await page.fill('[data-testid="booking-guest-name"]', 'Edited Guest Name')
    await page.fill('[data-testid="booking-notes"]', 'Updated booking notes')
    
    // Change status
    await page.click('[data-testid="booking-status-select"]')
    await page.click('[data-testid="status-confirmed"]')
    
    // Save changes
    await page.click('[data-testid="update-booking"]')
    
    // Verify booking updated
    await expect(page.locator('[data-testid="booking-updated-success"]')).toBeVisible()
    
    // Verify changes reflected in table
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Edited Guest Name' })).toBeVisible()
  })

  test('should delete booking with confirmation', async ({ page }) => {
    // Create a booking to delete
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Delete Test Guest')
    await page.fill('[data-testid="booking-email"]', 'delete@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Find and click delete booking
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Test Guest' }).locator('[data-testid="delete-booking-btn"]').click()
    
    // Wait for confirmation modal
    await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="delete-warning-message"]')).toBeVisible()
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]')
    
    // Verify booking deleted
    await expect(page.locator('[data-testid="booking-deleted-success"]')).toBeVisible()
    
    // Verify booking removed from table
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Test Guest' })).toHaveCount(0)
  })

  test('should validate booking form fields', async ({ page }) => {
    // Click create booking
    await page.click('[data-testid="create-booking-btn"]')
    await expect(page.locator('[data-testid="create-booking-modal"]')).toBeVisible()
    
    // Try to submit without required fields
    await page.click('[data-testid="save-booking"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="guest-name-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="experience-error"]')).toBeVisible()
    
    // Fill invalid email
    await page.fill('[data-testid="booking-email"]', 'invalid-email')
    await page.click('[data-testid="save-booking"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email')
    
    // Fill valid data but invalid phone
    await page.fill('[data-testid="booking-guest-name"]', 'Valid Name')
    await page.fill('[data-testid="booking-email"]', 'valid@example.com')
    await page.fill('[data-testid="booking-phone"]', '123')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    
    await expect(page.locator('[data-testid="phone-error"]')).toContainText('valid phone')
  })

  test('should handle booking status updates', async ({ page }) => {
    // Create a booking
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Status Test Guest')
    await page.fill('[data-testid="booking-email"]', 'status@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Edit booking to change status
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Status Test Guest' }).locator('[data-testid="edit-booking-btn"]').click()
    
    // Test different status changes
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed']
    
    for (const status of statuses) {
      await page.click('[data-testid="booking-status-select"]')
      await page.click(`[data-testid="status-${status}"]`)
      await page.click('[data-testid="update-booking"]')
      
      await expect(page.locator('[data-testid="booking-updated-success"]')).toBeVisible()
      
      // Verify status badge updated
      await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Status Test Guest' }).locator(`[data-testid="status-${status}"]`)).toBeVisible()
      
      // Reopen for next status change
      await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Status Test Guest' }).locator('[data-testid="edit-booking-btn"]').click()
    }
  })

  test('should handle bulk operations', async ({ page }) => {
    // Create multiple bookings
    for (let i = 1; i <= 3; i++) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `Bulk Test Guest ${i}`)
      await page.fill('[data-testid="booking-email"]', `bulk${i}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Select multiple bookings
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Bulk Test Guest' }).locator('[data-testid="booking-checkbox"]').click()
    
    // Verify bulk actions appear
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()
    await expect(page.locator('[data-testid="bulk-delete"]')).toBeVisible()
    await expect(page.locator('[data-testid="bulk-status-update"]')).toBeVisible()
    
    // Test bulk status update
    await page.click('[data-testid="bulk-status-update"]')
    await page.click('[data-testid="bulk-status-confirmed"]')
    await page.click('[data-testid="apply-bulk-status"]')
    
    // Verify bulk update success
    await expect(page.locator('[data-testid="bulk-update-success"]')).toBeVisible()
    
    // Verify all selected bookings have confirmed status
    const confirmedBookings = await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Bulk Test Guest' }).locator('[data-testid="status-confirmed"]').count()
    expect(confirmedBookings).toBe(3)
  })

  test('should handle booking search and filter', async ({ page }) => {
    // Create test bookings with different data
    const testBookings = [
      { name: 'Search Test 1', email: 'search1@example.com', experience: 'surf-week' },
      { name: 'Search Test 2', email: 'search2@example.com', experience: 'surf-camp' },
      { name: 'Different Name', email: 'different@example.com', experience: 'surf-week' }
    ]
    
    for (const booking of testBookings) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', booking.name)
      await page.fill('[data-testid="booking-email"]', booking.email)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click(`[data-testid="option-${booking.experience}"]`)
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Test search by name
    await page.fill('[data-testid="search-input"]', 'Search Test')
    await page.click('[data-testid="search-btn"]')
    
    // Should show only 2 results
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(2)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Search Test' })).toHaveCount(2)
    
    // Test search by email
    await page.fill('[data-testid="search-input"]', 'search1@example.com')
    await page.click('[data-testid="search-btn"]')
    
    // Should show only 1 result
    await expect(page.locator('[data-testid="booking-row"]')).toHaveCount(1)
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'search1@example.com' })).toHaveCount(1)
    
    // Test filter by experience
    await page.click('[data-testid="clear-search"]')
    await page.click('[data-testid="experience-filter"]')
    await page.click('[data-testid="filter-surf-week"]')
    
    // Should show only surf-week bookings
    const surfWeekBookings = await page.locator('[data-testid="booking-row"]').locator('[data-testid="experience-surf-week"]').count()
    expect(surfWeekBookings).toBeGreaterThan(0)
    
    // Test filter by status
    await page.click('[data-testid="status-filter"]')
    await page.click('[data-testid="filter-pending"]')
    
    // Should show only pending bookings
    const pendingBookings = await page.locator('[data-testid="booking-row"]').locator('[data-testid="status-pending"]').count()
    expect(pendingBookings).toBeGreaterThan(0)
  })
})
