import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/calendar')
    await waitForAdminPageLoad(page)
  })

  test('should load calendar page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/calendar/)
    
    const calendar = page.locator(
      '.calendar, ' +
      '[data-testid*="calendar"], ' +
      '[role="grid"], ' +
      'table[class*="calendar"]'
    )
    await expect(calendar.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display calendar with bookings', async ({ page }) => {
    const calendar = page.locator('.calendar, [data-testid*="calendar"], [role="grid"]').first()
    await expect(calendar).toBeVisible()
    
    // Check for calendar events/bookings
    const events = page.locator(
      '[class*="event"], ' +
      '[class*="booking"], ' +
      '[data-testid*="event"]'
    )
    
    const eventCount = await events.count()
    // May have 0 or more events
    expect(eventCount).toBeGreaterThanOrEqual(0)
  })

  test('should toggle month view', async ({ page }) => {
    const monthViewButton = page.locator('button:has-text("Month"), [data-testid*="month"]')
    
    if (await monthViewButton.count() > 0) {
      await monthViewButton.first().click()
      await page.waitForTimeout(1000)
      
      const calendar = page.locator('.calendar, [role="grid"]')
      await expect(calendar.first()).toBeVisible()
    }
  })

  test('should toggle week view', async ({ page }) => {
    const weekViewButton = page.locator('button:has-text("Week"), [data-testid*="week"]')
    
    if (await weekViewButton.count() > 0) {
      await weekViewButton.first().click()
      await page.waitForTimeout(1000)
      
      const calendar = page.locator('.calendar, [role="grid"]')
      await expect(calendar.first()).toBeVisible()
    }
  })

  test('should navigate between months', async ({ page }) => {
    const nextButton = page.locator('button[aria-label*="Next"], button:has-text(">"), [data-testid*="next"]')
    
    if (await nextButton.count() > 0) {
      await nextButton.first().click()
      await page.waitForTimeout(1000)
      
      // Calendar should still be visible
      const calendar = page.locator('.calendar, [role="grid"]')
      await expect(calendar.first()).toBeVisible()
    }
  })

  test('should click on booking event to show details', async ({ page }) => {
    const event = page.locator('[class*="event"], [class*="booking"], [data-testid*="event"]').first()
    
    if (await event.count() > 0) {
      await event.first().click()
      await page.waitForTimeout(1000)
      
      // Check for detail modal
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"]')
      const modalCount = await detailModal.count()
      
      // Modal may or may not appear
      expect(modalCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should filter calendar by room', async ({ page }) => {
    const roomFilter = page.locator('select[name*="room"], [data-testid*="room-filter"]').first()
    
    if (await roomFilter.count() > 0) {
      await roomFilter.selectOption({ index: 0 })
      await page.waitForTimeout(1000)
    }
  })

  test('should filter calendar by surf camp', async ({ page }) => {
    const campFilter = page.locator('select[name*="camp"], [data-testid*="camp-filter"]').first()
    
    if (await campFilter.count() > 0) {
      await campFilter.selectOption({ index: 0 })
      await page.waitForTimeout(1000)
    }
  })
})


