import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Gallery Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/gallery')
    await waitForAdminPageLoad(page)
  })

  test('should load gallery page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/gallery/)
    
    const gallery = page.locator('[class*="gallery"], [data-testid*="gallery"], [class*="grid"]')
    await expect(gallery.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display gallery images', async ({ page }) => {
    const images = page.locator('img, [class*="image"], [data-testid*="image"]')
    const count = await images.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to upload page', async ({ page }) => {
    const uploadButton = page.locator('button:has-text("Upload"), a[href*="upload"]')
    
    if (await uploadButton.count() > 0) {
      await uploadButton.first().click()
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveURL(/.*\/admin\/gallery\/upload/)
    }
  })
})


