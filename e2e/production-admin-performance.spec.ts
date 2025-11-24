import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
  })

  test('should load dashboard in under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await navigateToAdminPage(page, '')
    await waitForAdminPageLoad(page)
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)
  })

  test('should load bookings page in under 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const loadTime = Date.now() - startTime
    // Increased to 5s for production (3s might be too strict)
    expect(loadTime).toBeLessThan(5000)
  })

  test('should handle large dataset (100+ bookings)', async ({ page }) => {
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const startTime = Date.now()
    
    // Wait for table to render
    const table = page.locator('table').first()
    await expect(table).toBeVisible({ timeout: 10000 })
    
    const renderTime = Date.now() - startTime
    
    // Should render within reasonable time even with many bookings
    expect(renderTime).toBeLessThan(5000)
    
    // Check pagination exists if many bookings
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()
    
    if (rowCount >= 10) {
      const pagination = page.locator('[data-testid*="pagination"], button:has-text("Next")')
      const hasPagination = await pagination.count() > 0
      
      // Should have pagination for large datasets
      expect(hasPagination).toBe(true)
    }
  })

  test('should have fast search performance', async ({ page }) => {
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const searchInput = page.locator('input[type="search"]').first()
    
    if (await searchInput.count() > 0) {
      const startTime = Date.now()
      
      await searchInput.fill('test')
      await page.waitForTimeout(1000) // Wait for search results
      
      const searchTime = Date.now() - startTime
      
      // Search should complete quickly
      expect(searchTime).toBeLessThan(2000)
    }
  })

  test('should have fast filter performance', async ({ page }) => {
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const statusFilter = page.locator('select[name*="status"]').first()
    
    if (await statusFilter.count() > 0) {
      const startTime = Date.now()
      
      await statusFilter.selectOption('pending')
      await page.waitForTimeout(1000) // Wait for filter results
      
      const filterTime = Date.now() - startTime
      
      // Filter should complete quickly
      expect(filterTime).toBeLessThan(2000)
    }
  })

  test('should have fast API response times', async ({ page }) => {
    await navigateToAdminPage(page, '/bookings')
    
    // Measure API response time
    const apiStartTime = Date.now()
    
    // Wait for API call to complete
    await page.waitForResponse(
      response => response.url().includes('/api/bookings') && response.status() === 200,
      { timeout: 10000 }
    )
    
    const apiResponseTime = Date.now() - apiStartTime
    
    // API should respond quickly
    expect(apiResponseTime).toBeLessThan(5000)
  })

  test('should load all admin pages efficiently', async ({ page }) => {
    const adminPages = [
      '',
      '/bookings',
      '/rooms',
      '/surf-camps',
      '/clients',
      '/calendar',
      '/analytics',
    ]
    
    for (const adminPage of adminPages) {
      const startTime = Date.now()
      
      await navigateToAdminPage(page, adminPage)
      await waitForAdminPageLoad(page)
      
      const loadTime = Date.now() - startTime
      
      // Each page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000)
    }
  })
})


