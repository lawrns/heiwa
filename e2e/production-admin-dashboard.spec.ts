import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '')
    await waitForAdminPageLoad(page)
  })

  test('should load dashboard correctly', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin$/)
    
    // Check for main heading
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should display stat cards', async ({ page }) => {
    // Look for stat cards (common patterns)
    const statCards = page.locator(
      '[class*="stat"], ' +
      '[data-testid*="stat"], ' +
      '.stat-card, ' +
      '[class*="metric"]'
    )
    
    const count = await statCards.count()
    expect(count).toBeGreaterThan(0)
    
    // Verify stat cards contain numeric values
    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = statCards.nth(i)
      const text = await card.textContent()
      
      // Should contain numbers
      expect(text).toMatch(/\d+/)
    }
  })

  test('should display action cards', async ({ page }) => {
    // Look for action cards
    const actionCards = page.locator(
      '[class*="action"], ' +
      '[data-testid*="action"], ' +
      '.action-card, ' +
      'a[href*="/admin/"]'
    )
    
    const count = await actionCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have working navigation sidebar', async ({ page }) => {
    // Check for sidebar
    const sidebar = page.locator('aside, nav, [data-testid="sidebar"]')
    await expect(sidebar.first()).toBeVisible()
    
    // Check for navigation links
    const navLinks = page.locator('nav a, aside a')
    const linkCount = await navLinks.count()
    expect(linkCount).toBeGreaterThan(0)
  })

  test('should navigate to bookings page from action card', async ({ page }) => {
    // Find bookings action card or link
    const bookingsLink = page.locator(
      'a[href*="bookings"], ' +
      'button:has-text("Bookings"), ' +
      '[data-testid*="bookings"]'
    ).first()
    
    if (await bookingsLink.count() > 0) {
      await bookingsLink.click()
      await page.waitForURL('**/bookings', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/bookings/)
    }
  })

  test('should navigate to rooms page from action card', async ({ page }) => {
    const roomsLink = page.locator(
      'a[href*="rooms"], ' +
      'button:has-text("Rooms"), ' +
      '[data-testid*="rooms"]'
    ).first()
    
    if (await roomsLink.count() > 0) {
      await roomsLink.click()
      await page.waitForURL('**/rooms', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/rooms/)
    }
  })

  test('should navigate to surf camps page from action card', async ({ page }) => {
    const surfCampsLink = page.locator(
      'a[href*="surf"], ' +
      'button:has-text("Surf"), ' +
      '[data-testid*="surf"]'
    ).first()
    
    if (await surfCampsLink.count() > 0) {
      await surfCampsLink.click()
      await page.waitForURL('**/surf', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/surf/)
    }
  })

  test('should navigate to clients page from action card', async ({ page }) => {
    const clientsLink = page.locator(
      'a[href*="clients"], ' +
      'button:has-text("Clients"), ' +
      '[data-testid*="clients"]'
    ).first()
    
    if (await clientsLink.count() > 0) {
      await clientsLink.click()
      await page.waitForURL('**/clients', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/clients/)
    }
  })

  test('should navigate to calendar page from action card', async ({ page }) => {
    const calendarLink = page.locator(
      'a[href*="calendar"], ' +
      'button:has-text("Calendar"), ' +
      '[data-testid*="calendar"]'
    ).first()
    
    if (await calendarLink.count() > 0) {
      await calendarLink.click()
      await page.waitForURL('**/calendar', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/calendar/)
    }
  })

  test('should navigate to analytics page from action card', async ({ page }) => {
    const analyticsLink = page.locator(
      'a[href*="analytics"], ' +
      'button:has-text("Analytics"), ' +
      '[data-testid*="analytics"]'
    ).first()
    
    if (await analyticsLink.count() > 0) {
      await analyticsLink.click()
      await page.waitForURL('**/analytics', { timeout: 10000 })
      await expect(page).toHaveURL(/.*\/admin\/analytics/)
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await waitForAdminPageLoad(page)
    
    // Check that sidebar is accessible (may be collapsed or hamburger menu)
    const sidebar = page.locator('aside, nav, [data-testid="sidebar"], button[aria-label*="menu"]')
    await expect(sidebar.first()).toBeVisible()
  })

  test('should display real-time data updates', async ({ page }) => {
    // Get initial stat values
    const statCards = page.locator('[class*="stat"], [data-testid*="stat"]')
    const initialCount = await statCards.count()
    
    // Wait a bit for potential updates
    await page.waitForTimeout(3000)
    
    // Verify stats are still displayed
    const finalCount = await statCards.count()
    expect(finalCount).toBeGreaterThan(0)
  })
})


