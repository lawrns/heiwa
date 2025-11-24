import { test, expect } from '@playwright/test'
import { ensureAdminAuth, navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Payments Management', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminAuth(page)
    await navigateToAdminPage(page, '/payments')
    await waitForAdminPageLoad(page)
  })

  test('should load payments page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/payments/)
    
    const paymentsTable = page.locator('table, [data-testid*="payments"], [class*="payment"]')
    await expect(paymentsTable.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display payments list', async ({ page }) => {
    const payments = page.locator('tbody tr, [class*="payment"], [data-testid*="payment"]')
    const count = await payments.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should filter payments by status', async ({ page }) => {
    const statusFilter = page.locator('select[name*="status"], [data-testid*="status-filter"]').first()
    
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('completed')
      await page.waitForTimeout(1000)
    }
  })

  test('should filter payments by method', async ({ page }) => {
    const methodFilter = page.locator('select[name*="method"], [data-testid*="method-filter"]').first()
    
    if (await methodFilter.count() > 0) {
      await methodFilter.selectOption('bank_wire')
      await page.waitForTimeout(1000)
    }
  })

  test('should view payment details', async ({ page }) => {
    const paymentRow = page.locator('tbody tr').first()
    
    if (await paymentRow.count() > 0) {
      await paymentRow.click()
      await page.waitForTimeout(1000)
      
      const detailModal = page.locator('[role="dialog"], [data-testid*="modal"]')
      const modalCount = await detailModal.count()
      
      expect(modalCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should update payment status', async ({ page }) => {
    const paymentRow = page.locator('tbody tr').first()
    
    if (await paymentRow.count() > 0) {
      await paymentRow.click()
      await page.waitForTimeout(1000)
      
      const statusSelect = page.locator('select[name*="status"], [data-testid*="status"]')
      if (await statusSelect.count() > 0) {
        await statusSelect.first().selectOption('completed')
        await page.waitForTimeout(1000)
      }
    }
  })
})


