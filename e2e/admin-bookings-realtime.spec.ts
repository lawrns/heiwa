import { test, expect } from '@playwright/test'

test.describe('Admin Bookings Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')
  })

  test('should show real-time booking updates', async ({ page }) => {
    // Open two pages to simulate real-time updates
    const context = page.context()
    const page2 = await context.newPage()
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    // Count initial bookings on both pages
    const initialCount1 = await page.locator('[data-testid="booking-row"]').count()
    const initialCount2 = await page2.locator('[data-testid="booking-row"]').count()
    
    // Create a new booking on page1
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Realtime Test User')
    await page.fill('[data-testid="booking-email"]', 'realtime@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Wait for real-time update on page2
    await page2.waitForTimeout(2000) // Allow time for real-time sync
    
    // Verify both pages show the new booking
    const newCount1 = await page.locator('[data-testid="booking-row"]').count()
    const newCount2 = await page2.locator('[data-testid="booking-row"]').count()
    
    expect(newCount1).toBe(initialCount1 + 1)
    expect(newCount2).toBe(initialCount2 + 1)
    
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Realtime Test User' })).toBeVisible()
    
    await page2.close()
  })

  test('should show real-time status changes', async ({ page }) => {
    // Create a booking first
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Status Realtime User')
    await page.fill('[data-testid="booking-email"]', 'status@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Open second page
    const context = page.context()
    const page2 = await context.newPage()
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    // Edit booking on page1 to change status
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Status Realtime User' }).locator('[data-testid="edit-booking-btn"]').click()
    await page.click('[data-testid="booking-status-select"]')
    await page.click('[data-testid="status-confirmed"]')
    await page.click('[data-testid="update-booking"]')
    await page.waitForSelector('[data-testid="booking-updated-success"]')
    
    // Wait for real-time update on page2
    await page2.waitForTimeout(2000)
    
    // Verify status updated on page2
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Status Realtime User' }).locator('[data-testid="status-confirmed"]')).toBeVisible()
    
    await page2.close()
  })

  test('should show real-time booking deletions', async ({ page }) => {
    // Create a booking to delete
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Delete Realtime User')
    await page.fill('[data-testid="booking-email"]', 'delete@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Open second page
    const context = page.context()
    const page2 = await context.newPage()
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    // Verify booking exists on both pages
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Realtime User' })).toBeVisible()
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Realtime User' })).toBeVisible()
    
    // Delete booking on page1
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Realtime User' }).locator('[data-testid="delete-booking-btn"]').click()
    await page.click('[data-testid="confirm-delete"]')
    await page.waitForSelector('[data-testid="booking-deleted-success"]')
    
    // Wait for real-time update on page2
    await page2.waitForTimeout(2000)
    
    // Verify booking removed from page2
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Delete Realtime User' })).toHaveCount(0)
    
    await page2.close()
  })

  test('should show real-time booking modifications', async ({ page }) => {
    // Create a booking to modify
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Modify Realtime User')
    await page.fill('[data-testid="booking-email"]', 'modify@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Open second page
    const context = page.context()
    const page2 = await context.newPage()
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    // Edit booking on page1
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Modify Realtime User' }).locator('[data-testid="edit-booking-btn"]').click()
    await page.fill('[data-testid="booking-guest-name"]', 'Modified Realtime User')
    await page.fill('[data-testid="booking-notes"]', 'Updated via real-time test')
    await page.click('[data-testid="update-booking"]')
    await page.waitForSelector('[data-testid="booking-updated-success"]')
    
    // Wait for real-time update on page2
    await page2.waitForTimeout(2000)
    
    // Verify modifications on page2
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Modified Realtime User' })).toBeVisible()
    await expect(page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Modify Realtime User' })).toHaveCount(0)
    
    // Check updated details
    await page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Modified Realtime User' }).locator('[data-testid="view-booking-btn"]').click()
    await expect(page2.locator('[data-testid="booking-notes-display"]')).toContainText('Updated via real-time test')
    
    await page2.close()
  })

  test('should handle concurrent booking updates', async ({ page }) => {
    // Create a booking
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Concurrent Test User')
    await page.fill('[data-testid="booking-email"]', 'concurrent@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Open two additional pages
    const context = page.context()
    const page2 = await context.newPage()
    const page3 = await context.newPage()
    
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    await page3.goto('/admin/bookings')
    await page3.waitForLoadState('networkidle')
    
    // Simultaneously edit the same booking from different pages
    await page.locator('[data-testid="booking-row"]').filter({ hasText: 'Concurrent Test User' }).locator('[data-testid="edit-booking-btn"]').click()
    await page.fill('[data-testid="booking-guest-name"]', 'Concurrent Updated by Page 1')
    
    await page2.locator('[data-testid="booking-row"]').filter({ hasText: 'Concurrent Test User' }).locator('[data-testid="edit-booking-btn"]').click()
    await page2.fill('[data-testid="booking-guest-name"]', 'Concurrent Updated by Page 2')
    
    // Save from page1 first
    await page.click('[data-testid="update-booking"]')
    await page.waitForSelector('[data-testid="booking-updated-success"]')
    
    // Try to save from page2 (should show conflict or overwrite warning)
    await page2.click('[data-testid="update-booking"]')
    
    // Check for conflict resolution
    const conflictWarning = await page2.locator('[data-testid="conflict-warning"]').count()
    if (conflictWarning > 0) {
      await expect(page2.locator('[data-testid="conflict-warning"]')).toBeVisible()
      await page2.click('[data-testid="overwrite-changes"]')
      await page2.waitForSelector('[data-testid="booking-updated-success"]')
    }
    
    // Wait for real-time sync
    await page3.waitForTimeout(3000)
    
    // Verify final state across all pages
    const finalName = await page3.locator('[data-testid="booking-row"]').filter({ hasText: 'Concurrent' }).locator('[data-testid="guest-name"]').textContent()
    expect(finalName).toContain('Concurrent Updated')
    
    await page2.close()
    await page3.close()
  })

  test('should show real-time connection status', async ({ page }) => {
    // Check initial connection status
    await expect(page.locator('[data-testid="connection-status"]')).toBeVisible()
    await expect(page.locator('[data-testid="connection-indicator"]')).toHaveClass(/connected/)
    
    // Simulate connection loss (if supported)
    await page.evaluate(() => {
      // Simulate offline mode
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false
      })
      window.dispatchEvent(new Event('offline'))
    })
    
    // Wait for connection status update
    await page.waitForTimeout(1000)
    
    // Verify offline status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Offline')
    await expect(page.locator('[data-testid="connection-indicator"]')).toHaveClass(/disconnected/)
    
    // Simulate connection restore
    await page.evaluate(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: true
      })
      window.dispatchEvent(new Event('online'))
    })
    
    // Wait for reconnection
    await page.waitForTimeout(2000)
    
    // Verify reconnected status
    await expect(page.locator('[data-testid="connection-status"]')).toContainText('Online')
    await expect(page.locator('[data-testid="connection-indicator"]')).toHaveClass(/connected/)
  })

  test('should handle real-time search updates', async ({ page }) => {
    // Open two pages
    const context = page.context()
    const page2 = await context.newPage()
    
    await page.goto('/admin/bookings')
    await page2.goto('/admin/bookings')
    
    await page.waitForLoadState('networkidle')
    await page2.waitForLoadState('networkidle')
    
    // Apply search filter on page1
    await page.fill('[data-testid="search-input"]', 'Realtime Search')
    await page.click('[data-testid="search-btn"]')
    
    // Create booking that matches search on page2
    await page2.click('[data-testid="create-booking-btn"]')
    await page2.fill('[data-testid="booking-guest-name"]', 'Realtime Search User')
    await page2.fill('[data-testid="booking-email"]', 'search@example.com')
    await page2.click('[data-testid="booking-experience-select"]')
    await page2.click('[data-testid="option-surf-week"]')
    await page2.click('[data-testid="save-booking"]')
    await page2.waitForSelector('[data-testid="booking-created-success"]')
    
    // Wait for real-time update on page1
    await page.waitForTimeout(2000)
    
    // Verify new booking appears in search results on page1
    await expect(page.locator('[data-testid="booking-row"]').filter({ hasText: 'Realtime Search User' })).toBeVisible()
    
    await page2.close()
  })

  test('should show real-time statistics updates', async ({ page }) => {
    // Get initial statistics
    const initialBookings = await page.locator('[data-testid="total-bookings-count"]').textContent()
    const initialRevenue = await page.locator('[data-testid="total-revenue"]').textContent()
    
    // Create a new booking
    await page.click('[data-testid="create-booking-btn"]')
    await page.fill('[data-testid="booking-guest-name"]', 'Stats Test User')
    await page.fill('[data-testid="booking-email"]', 'stats@example.com')
    await page.click('[data-testid="booking-experience-select"]')
    await page.click('[data-testid="option-surf-week"]')
    await page.click('[data-testid="save-booking"]')
    await page.waitForSelector('[data-testid="booking-created-success"]')
    
    // Wait for statistics to update
    await page.waitForTimeout(2000)
    
    // Verify statistics updated
    const newBookings = await page.locator('[data-testid="total-bookings-count"]').textContent()
    const newRevenue = await page.locator('[data-testid="total-revenue"]').textContent()
    
    expect(parseInt(newBookings || '0')).toBe(parseInt(initialBookings || '0') + 1)
    expect(parseFloat(newRevenue?.replace('€', '') || '0')).toBeGreaterThan(parseFloat(initialRevenue?.replace('€', '') || '0'))
  })

  test('should handle real-time pagination updates', async ({ page }) => {
    // Create multiple bookings to test pagination
    for (let i = 1; i <= 15; i++) {
      await page.click('[data-testid="create-booking-btn"]')
      await page.fill('[data-testid="booking-guest-name"]', `Pagination Test User ${i}`)
      await page.fill('[data-testid="booking-email"]', `pagination${i}@example.com`)
      await page.click('[data-testid="booking-experience-select"]')
      await page.click('[data-testid="option-surf-week"]')
      await page.click('[data-testid="save-booking"]')
      await page.waitForSelector('[data-testid="booking-created-success"]')
    }
    
    // Go to page 2
    await page.click('[data-testid="pagination-next"]')
    await page.waitForSelector('[data-testid="page-2-active"]')
    
    // Open second page on page 1
    const context = page.context()
    const page2 = await context.newPage()
    await page2.goto('/admin/bookings')
    await page2.waitForLoadState('networkidle')
    
    // Delete a booking from page1 (page 2)
    await page.locator('[data-testid="booking-row"]').first().locator('[data-testid="delete-booking-btn"]').click()
    await page.click('[data-testid="confirm-delete"]')
    await page.waitForSelector('[data-testid="booking-deleted-success"]')
    
    // Wait for real-time update
    await page2.waitForTimeout(2000)
    
    // Verify pagination updated on page2
    const totalCount = await page2.locator('[data-testid="total-results"]').textContent()
    expect(totalCount).toContain('14') // One less than initial 15
    
    await page2.close()
  })
})
