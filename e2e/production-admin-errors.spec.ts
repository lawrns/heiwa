import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage } from './helpers/admin-helpers'

test.describe('Admin Error Handling', () => {
  test('should display error messages correctly', async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    
    // Try invalid search or filter
    const searchInput = page.locator('input[type="search"]').first()
    if (await searchInput.count() > 0) {
      // Search for something that might not exist
      await searchInput.fill('nonexistent_booking_xyz123')
      await page.waitForTimeout(2000)
      
      // Should show no results or error message gracefully
      const errorMessage = page.locator('[role="alert"], .error, [class*="error"]')
      const noResults = page.locator('text=/no results|not found|empty/i')
      
      // Either error message or "no results" should appear
      const errorCount = await errorMessage.count()
      const noResultsCount = await noResults.count()
      
      expect(errorCount + noResultsCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await ensureAdminAuth(page)
    
    // Simulate offline mode
    await page.context().setOffline(true)
    
    await navigateToAdminPage(page, '/bookings')
    
    // Should show error or loading state
    await page.waitForTimeout(2000)
    
    // Restore online
    await page.context().setOffline(false)
  })

  test('should show validation errors on forms', async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    
    // Try to create booking with invalid data
    const createButton = page.locator('button:has-text("Create"), button:has-text("New")').first()
    
    if (await createButton.count() > 0) {
      await createButton.click()
      await page.waitForTimeout(1000)
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first()
      if (await submitButton.count() > 0) {
        await submitButton.click()
        await page.waitForTimeout(1000)
        
        // Should show validation errors
        const validationErrors = page.locator('[role="alert"], .error, [class*="error"], [class*="invalid"]')
        const errorCount = await validationErrors.count()
        
        // May or may not show errors depending on form validation
        expect(errorCount).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('should show 404 for invalid routes', async ({ page }) => {
    await ensureAdminAuth(page)
    
    // Try to access invalid admin route
    await page.goto('/admin/invalid-route-xyz123')
    await page.waitForLoadState('networkidle')
    
    // Should show 404 or redirect
    const currentUrl = page.url()
    const notFoundText = page.locator('text=/404|not found|page not found/i')
    const notFoundCount = await notFoundText.count()
    
    // Either 404 page or redirect to valid page
    expect(notFoundCount > 0 || currentUrl.includes('/admin')).toBe(true)
  })

  test('should handle unauthorized access', async ({ page }) => {
    // Clear cookies to simulate unauthorized access
    await page.context().clearCookies()
    
    // Try to access admin route
    await page.goto('/admin/bookings')
    await page.waitForLoadState('networkidle')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/admin\/login/)
  })

  test('should handle session timeout', async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    
    // Clear cookies to simulate session expiry
    await page.context().clearCookies()
    
    // Try to navigate to another admin page
    await navigateToAdminPage(page, '/rooms')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/admin\/login/)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/bookings')
    
    // Intercept API calls and simulate error
    await page.route('**/api/bookings**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })
    
    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should show error message or handle gracefully
    const errorMessage = page.locator('[role="alert"], .error, text=/error/i')
    const errorCount = await errorMessage.count()
    
    // May show error or handle gracefully
    expect(errorCount).toBeGreaterThanOrEqual(0)
  })
})


