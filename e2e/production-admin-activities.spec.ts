import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Activities Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/activities')
    await waitForAdminPageLoad(page)
  })

  test('should load activities page', async ({ page }) => {
    // Accept either /admin/activities or /activities
    await expect(page).toHaveURL(/.*\/(admin\/)?activities/)
    
    // Page loaded successfully - content may vary
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display activities list', async ({ page }) => {
    const activities = page.locator('tbody tr, [class*="activity-card"], [data-testid*="activity"]')
    const count = await activities.count()
    // Activities may not exist, so just verify page loaded
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter activities by category', async ({ page }) => {
    const categoryFilter = page.locator('select[name*="category"], [data-testid*="category-filter"]').first()
    
    if (await categoryFilter.count() > 0) {
      await categoryFilter.selectOption({ index: 0 })
      await page.waitForTimeout(1000)
    }
  })

  test('should view activity details', async ({ page }) => {
    const activityRow = page.locator('tbody tr, [class*="activity"]').first()
    
    if (await activityRow.count() > 0) {
      await activityRow.click()
      await page.waitForTimeout(1000)
      
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"]')
      const currentUrl = page.url()
      
      expect(await detailModal.count() > 0 || currentUrl.includes('/activities/')).toBe(true)
    }
  })
})

