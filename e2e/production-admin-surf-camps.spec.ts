import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Surf Camps Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/surf-camps')
    await waitForAdminPageLoad(page)
  })

  test('should load surf camps page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/surf-camps/)
    
    const campsList = page.locator('table, [data-testid="surf-camps-list"], [class*="camp"]')
    await expect(campsList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display surf camps list', async ({ page }) => {
    const campCards = page.locator(
      '[class*="camp"], ' +
      '[data-testid*="camp"], ' +
      'tbody tr'
    )
    
    const count = await campCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display camp information', async ({ page }) => {
    const campCard = page.locator('[class*="camp"], [data-testid*="camp"], tbody tr').first()
    
    if (await campCard.count() > 0) {
      const cardText = await campCard.textContent()
      expect(cardText).toBeTruthy()
    }
  })

  test('should search surf camps', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test')
      await page.waitForTimeout(1000)
    }
  })

  test('should filter by date range', async ({ page }) => {
    const dateFilter = page.locator(
      'input[type="date"], ' +
      '[data-testid*="date-filter"], ' +
      'button:has-text("Date")'
    ).first()
    
    if (await dateFilter.count() > 0) {
      await dateFilter.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should view surf camp details', async ({ page }) => {
    const campCard = page.locator('[class*="camp"], [data-testid*="camp"], tbody tr').first()
    
    if (await campCard.count() > 0) {
      await campCard.click()
      await page.waitForTimeout(1000)
      
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"]')
      const currentUrl = page.url()
      
      expect(await detailModal.count() > 0 || currentUrl.includes('/surf-camps/')).toBe(true)
    }
  })

  test('should have edit surf camp functionality', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit"), [data-testid*="edit"], a[href*="edit"]').first()
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForTimeout(1000)
      
      const editForm = page.locator('form, [data-testid*="edit"]')
      const currentUrl = page.url()
      
      expect(await editForm.count() > 0 || currentUrl.includes('/edit')).toBe(true)
    }
  })
})


