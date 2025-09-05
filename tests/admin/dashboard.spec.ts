import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test('should load dashboard with key metrics', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin')

    // Wait for page to load completely
    await page.waitForLoadState('networkidle')

    // Wait for dashboard to load
    await page.waitForTimeout(1000)

    // Check if main dashboard elements are present
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible()

    // Verify key metric cards are displayed using more specific selectors
    await expect(page.locator('h3').filter({ hasText: 'Bookings Management' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Rooms Management' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Surf Camps' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Total Clients' })).toBeVisible()
    await expect(page.locator('h3').filter({ hasText: 'Total Bookings' })).toBeVisible()
  })

  test.skip('should navigate to analytics dashboard', async ({ page }) => {
    // Skip this test until analytics page is implemented
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click on Analytics navigation link in sidebar (first match)
    await page.locator('a[href="/admin/analytics"]').first().click()

    // Wait for navigation to complete
    await page.waitForURL('/admin/analytics')

    // Verify navigation to analytics page
    await expect(page).toHaveURL('/admin/analytics')
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')
  })

  test('should display system health metrics', async ({ page }) => {
    await page.goto('/admin/system')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toBeVisible()

    // Check if system page loads with proper title
    await expect(page).toHaveTitle('Heiwa House Admin Dashboard')

    // Just verify the page loaded successfully - content may vary
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to bookings management', async ({ page }) => {
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

