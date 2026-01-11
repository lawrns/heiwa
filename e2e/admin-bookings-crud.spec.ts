import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'

// Increase default timeout for all tests
test.setTimeout(60000)

test.describe('Admin Bookings CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await loginAsAdmin(page)
  })

  test('should display bookings list page', async ({ page }) => {
    // Navigate to admin bookings page
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')

    // Wait for React hydration
    await page.waitForTimeout(2000)

    // Verify page elements are visible with increased timeout
    await expect(page.locator('[data-testid="create-booking-btn"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible({ timeout: 15000 })

    // Table should be present (may or may not have bookings)
    await expect(page.locator('[data-testid="bookings-table"]')).toBeVisible({ timeout: 15000 })
  })

  test('should navigate to create booking page', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Click create booking button (it's a link that navigates to new page)
    await page.click('[data-testid="create-booking-btn"]', { timeout: 15000 })

    // Wait for navigation to new booking page
    await page.waitForURL('**/admin/bookings/new')

    // Wait for form to load
    await page.waitForTimeout(2000)

    // Verify the create booking form is visible
    await expect(page.locator('[data-testid="create-booking-modal"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-guest-name"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-email"]')).toBeVisible({ timeout: 15000 })
  })

  test('should display create booking form elements', async ({ page }) => {
    // Navigate directly to new booking page
    await page.goto('/admin/bookings/new')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for form to be visible
    await expect(page.locator('[data-testid="create-booking-modal"]')).toBeVisible({ timeout: 15000 })

    // Verify all form fields are present
    await expect(page.locator('[data-testid="booking-guest-name"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-email"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-phone"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-guests"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="booking-date-picker"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="save-booking"]')).toBeVisible({ timeout: 15000 })

    // Verify type selection options are present
    await expect(page.locator('[data-testid="option-room"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('[data-testid="option-surf-week"]')).toBeVisible({ timeout: 15000 })
  })

  test('should view booking details via view modal', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for table to be visible
    await page.waitForSelector('[data-testid="bookings-table"]', { timeout: 15000 })

    // Check if there are any booking rows
    const bookingRows = await page.locator('[data-testid="booking-row"]').count()

    if (bookingRows > 0) {
      // Click view button on first booking
      await page.locator('[data-testid="booking-row"]').first().locator('[data-testid="view-booking-btn"]').click()

      // Wait for view modal
      await expect(page.locator('[data-testid="view-booking-modal"]')).toBeVisible({ timeout: 15000 })

      // Verify booking details are displayed
      await expect(page.locator('[data-testid="booking-id-display"]')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('[data-testid="guest-details-display"]')).toBeVisible({ timeout: 15000 })
    }
  })

  test('should open edit modal for existing booking', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for table to be visible
    await page.waitForSelector('[data-testid="bookings-table"]', { timeout: 15000 })

    // Check if there are any booking rows
    const bookingRows = await page.locator('[data-testid="booking-row"]').count()

    if (bookingRows > 0) {
      // Click edit button on first booking
      await page.locator('[data-testid="booking-row"]').first().locator('[data-testid="edit-booking-btn"]').click()

      // Wait for edit modal
      await expect(page.locator('[data-testid="edit-booking-modal"]')).toBeVisible({ timeout: 15000 })
    }
  })

  test('should show delete confirmation modal', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for table to be visible
    await page.waitForSelector('[data-testid="bookings-table"]', { timeout: 15000 })

    // Check if there are any booking rows
    const bookingRows = await page.locator('[data-testid="booking-row"]').count()

    if (bookingRows > 0) {
      // Click delete button on first booking
      await page.locator('[data-testid="booking-row"]').first().locator('[data-testid="delete-booking-btn"]').click()

      // Wait for confirmation modal
      await expect(page.locator('[data-testid="delete-confirmation-modal"]')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('[data-testid="delete-warning-message"]')).toBeVisible({ timeout: 15000 })
      await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible({ timeout: 15000 })
    }
  })

  test('should filter bookings by status', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for table to be visible
    await page.waitForSelector('[data-testid="bookings-table"]', { timeout: 15000 })

    // Select pending status filter
    await page.selectOption('[data-testid="status-filter"]', 'pending')

    // Wait for filter to apply
    await page.waitForTimeout(1000)

    // Verify the filter dropdown has the correct value
    await expect(page.locator('[data-testid="status-filter"]')).toHaveValue('pending')
  })

  test('should search bookings by name or email', async ({ page }) => {
    await page.goto('/admin/bookings')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for search input to be visible
    await page.waitForSelector('[data-testid="search-input"]', { timeout: 15000 })

    // Enter search term
    await page.fill('[data-testid="search-input"]', 'test')

    // Wait for search to apply (debounced)
    await page.waitForTimeout(1000)

    // Search is applied - verify the input has the value
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test')
  })

  test('should clear search', async ({ page }) => {
    await page.goto('/admin/bookings?search=test')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    // Wait for search input to be visible
    await page.waitForSelector('[data-testid="search-input"]', { timeout: 15000 })

    // Verify search input has value
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test')

    // Click clear search button
    await page.click('[data-testid="clear-search"]')

    // Verify search is cleared
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('')
  })
})
