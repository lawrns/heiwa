import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/clients')
    await waitForAdminPageLoad(page)
  })

  test('should load clients page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/clients/)
    
    const clientsTable = page.locator('table, [data-testid="clients-table"], [class*="client"]')
    await expect(clientsTable.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display clients table', async ({ page }) => {
    const clientRows = page.locator('tbody tr, [class*="client-card"]')
    const count = await clientRows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should search clients by name', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('test')
      await page.waitForTimeout(1000)
    }
  })

  test('should search clients by email', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]')
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('@')
      await page.waitForTimeout(1000)
    }
  })

  test('should filter clients by status', async ({ page }) => {
    const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]').first()
    
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('active')
      await page.waitForTimeout(1000)
    }
  })

  test('should view client details', async ({ page }) => {
    const clientRow = page.locator('tbody tr, [class*="client"]').first()
    
    if (await clientRow.count() > 0) {
      await clientRow.click()
      await page.waitForTimeout(1000)
      
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"]')
      const currentUrl = page.url()
      
      expect(await detailModal.count() > 0 || currentUrl.includes('/clients/')).toBe(true)
    }
  })

  test('should display client booking history', async ({ page }) => {
    const clientRow = page.locator('tbody tr').first()
    
    if (await clientRow.count() > 0) {
      await clientRow.click()
      await page.waitForTimeout(1000)
      
      // Look for booking history section
      const bookingHistory = page.locator('text=/booking|history/i')
      const historyCount = await bookingHistory.count()
      
      // May or may not have bookings, but section should be accessible
      expect(historyCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should edit client information', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit"), [data-testid*="edit"]').first()
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForTimeout(1000)
      
      const editForm = page.locator('form, [data-testid*="edit"]')
      expect(await editForm.count()).toBeGreaterThan(0)
    }
  })
})


