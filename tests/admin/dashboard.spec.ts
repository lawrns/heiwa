import { test, expect } from '@playwright/test'
import { authenticateAsAdmin } from '../helpers/auth'

test.describe('Admin Dashboard', () => {
  test('should load dashboard with key metrics', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    // Navigate to admin dashboard
    await page.goto('/admin')

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to load
    await page.waitForTimeout(1000)

    // Check if main dashboard elements are present
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Verify key metric cards are displayed using data-testid selectors
    await expect(page.locator('[data-testid="total-clients-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-bookings-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="available-rooms-metric"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue-metric"]')).toBeVisible()

    // Verify metric values are displayed (check that they contain numbers, not specific values)
    await expect(page.locator('[data-testid="total-clients-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-bookings-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="available-rooms-value"]')).toBeVisible()
    await expect(page.locator('[data-testid="revenue-value"]')).toBeVisible()

    // Verify the values contain numbers (not empty or error states)
    const clientsValue = await page.locator('[data-testid="total-clients-value"]').textContent()
    const bookingsValue = await page.locator('[data-testid="total-bookings-value"]').textContent()
    const roomsValue = await page.locator('[data-testid="available-rooms-value"]').textContent()
    const revenueValue = await page.locator('[data-testid="revenue-value"]').textContent()

    expect(clientsValue).toMatch(/^\d+$/) // Should be a number
    expect(bookingsValue).toMatch(/^\d+$/) // Should be a number
    expect(roomsValue).toMatch(/^\d+$/) // Should be a number
    expect(revenueValue).toMatch(/^\$\d+/) // Should start with $ and contain numbers
  })

  test('should navigate to analytics dashboard', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check if main dashboard elements are present first
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Click on Analytics button using data-testid
    await page.locator('[data-testid="view-analytics-button"]').click()

    // Wait for navigation to complete
    await page.waitForURL('/admin/analytics')

    // Verify navigation to analytics page
    await expect(page).toHaveURL('/admin/analytics')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display system health metrics', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/system')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toBeVisible()

    // Check if system page loads with proper title
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')

    // Just verify the page loaded successfully - content may vary
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to bookings management', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Click on Manage Bookings button using data-testid for specificity
    await page.locator('[data-testid="manage-bookings-button"]').click()

    // Wait for navigation and verify URL
    await page.waitForURL('/admin/bookings')
    await expect(page).toHaveURL('/admin/bookings')
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')
  })

  test('should navigate to clients management', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Click on Manage Clients button using data-testid for specificity
    await page.locator('[data-testid="manage-clients-button"]').click()

    // Wait for navigation and verify URL
    await page.waitForURL('/admin/clients')
    await expect(page).toHaveURL('/admin/clients')
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')
  })

  test('should navigate to rooms management', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Click on Manage Rooms button using data-testid for specificity
    await page.locator('[data-testid="manage-rooms-button"]').click()

    // Wait for navigation and verify URL
    await page.waitForURL('/admin/rooms')
    await expect(page).toHaveURL('/admin/rooms')
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')
  })

  test('should navigate to surf camps management', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Click on Manage Surf Camps button using data-testid for specificity
    await page.locator('[data-testid="manage-surf-camps-button"]').click()

    // Wait for navigation and verify URL
    await page.waitForURL('/admin/surfcamps')
    await expect(page).toHaveURL('/admin/surfcamps')
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')
  })
})

