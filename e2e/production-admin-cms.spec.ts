import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin CMS Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
  })

  test('should load CMS homepage editor', async ({ page }) => {
    await navigateToAdminPage(page, '/homepage')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/homepage/)
    
    const editor = page.locator('form, [data-testid*="editor"], [contenteditable]')
    await expect(editor.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load CMS pages management', async ({ page }) => {
    await navigateToAdminPage(page, '/cms/pages')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/cms\/pages/)
    
    const pagesList = page.locator('table, [data-testid*="pages-list"], [class*="page"]')
    await expect(pagesList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load FAQ management', async ({ page }) => {
    await navigateToAdminPage(page, '/cms/faq')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/cms\/faq/)
    
    const faqList = page.locator('table, [data-testid*="faq-list"], [class*="faq"]')
    await expect(faqList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load testimonials management', async ({ page }) => {
    await navigateToAdminPage(page, '/cms/testimonials')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/cms\/testimonials/)
    
    const testimonialsList = page.locator('table, [data-testid*="testimonials"], [class*="testimonial"]')
    await expect(testimonialsList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load CMS settings', async ({ page }) => {
    await navigateToAdminPage(page, '/cms/settings')
    await waitForAdminPageLoad(page)
    
    await expect(page).toHaveURL(/.*\/admin\/cms\/settings/)
    
    const settingsForm = page.locator('form, [data-testid*="settings"]')
    await expect(settingsForm.first()).toBeVisible({ timeout: 10000 })
  })

  test('should load media library', async ({ page }) => {
    await navigateToAdminPage(page, '/cms')
    await waitForAdminPageLoad(page)
    
    // Look for media library link or section
    const mediaLink = page.locator('a[href*="media"], button:has-text("Media")')
    
    if (await mediaLink.count() > 0) {
      await mediaLink.first().click()
      await page.waitForTimeout(1000)
      
      const mediaLibrary = page.locator('[class*="media"], [data-testid*="media"]')
      await expect(mediaLibrary.first()).toBeVisible({ timeout: 10000 })
    }
  })
})


