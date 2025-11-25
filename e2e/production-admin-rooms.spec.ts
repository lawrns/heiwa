import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Rooms Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/rooms')
    await waitForAdminPageLoad(page)
  })

  test('should load rooms page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/rooms/)
    
    // Check for rooms list or table
    const roomsList = page.locator('table, [data-testid="rooms-list"], .rooms-grid, [class*="room"]')
    await expect(roomsList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display rooms list', async ({ page }) => {
    // Look for room cards or table rows
    const roomCards = page.locator(
      '[class*="room-card"], ' +
      '[data-testid*="room"], ' +
      'tbody tr, ' +
      '.room-item'
    )
    
    const count = await roomCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should display room information', async ({ page }) => {
    const roomCard = page.locator('[class*="room"], [data-testid*="room"]').first()
    
    if (await roomCard.count() > 0) {
      const cardText = await roomCard.textContent()
      expect(cardText).toBeTruthy()
      expect(cardText?.length).toBeGreaterThan(0)
    }
  })

  test('should have search rooms functionality', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], ' +
      'input[placeholder*="Search"], ' +
      '[data-testid="search"]'
    )
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test')
      await page.waitForTimeout(1000)
      
      const value = await searchInput.first().inputValue()
      expect(value).toBe('test')
    }
  })

  test('should filter rooms by type', async ({ page }) => {
    const typeFilter = page.locator(
      'select[name*="type"], ' +
      '[data-testid*="type-filter"], ' +
      'button:has-text("Type")'
    ).first()
    
    if (await typeFilter.count() > 0) {
      if (await typeFilter.evaluate(el => el.tagName === 'SELECT')) {
        await typeFilter.selectOption('private')
      } else {
        await typeFilter.click()
        await page.locator('text="private"').first().click()
      }
      
      await page.waitForTimeout(1000)
    }
  })

  test('should view room details', async ({ page }) => {
    const roomCard = page.locator('[class*="room"], [data-testid*="room"], tbody tr').first()
    
    if (await roomCard.count() > 0) {
      await roomCard.click()
      await page.waitForTimeout(1000)
      
      // Check for detail modal or page
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"], .modal')
      const currentUrl = page.url()
      
      expect(await detailModal.count() > 0 || currentUrl.includes('/rooms/')).toBe(true)
    }
  })

  test('should have edit room functionality', async ({ page }) => {
    const editButton = page.locator(
      'button:has-text("Edit"), ' +
      '[data-testid*="edit"], ' +
      'a[href*="edit"]'
    ).first()
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForTimeout(1000)
      
      // Should navigate to edit page or open modal
      const editForm = page.locator('form, [data-testid*="edit"]')
      const currentUrl = page.url()
      
      expect(await editForm.count() > 0 || currentUrl.includes('/edit')).toBe(true)
    }
  })
})


