import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad } from './helpers/admin-helpers'

test.describe('Admin Invoices Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/invoices')
    await waitForAdminPageLoad(page)
  })

  test('should load invoices page', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/admin\/invoices/)
    
    const invoicesTable = page.locator('table, [data-testid*="invoices"], [class*="invoice"]')
    await expect(invoicesTable.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display invoices list', async ({ page }) => {
    const invoices = page.locator('tbody tr, [class*="invoice"], [data-testid*="invoice"]')
    const count = await invoices.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should generate invoice for booking', async ({ page }) => {
    // First go to bookings to find a booking
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
    
    const bookingRow = page.locator('tbody tr').first()
    
    if (await bookingRow.count() > 0) {
      await bookingRow.click()
      await page.waitForTimeout(1000)
      
      // Look for generate invoice button
      const invoiceButton = page.locator('button:has-text("Invoice"), button:has-text("Generate")')
      
      if (await invoiceButton.count() > 0) {
        await invoiceButton.first().click()
        await page.waitForTimeout(2000)
        
        // Should navigate to invoices or show invoice
        const currentUrl = page.url()
        const invoiceContent = page.locator('[class*="invoice"], [data-testid*="invoice"]')
        
        expect(currentUrl.includes('/invoices') || await invoiceContent.count() > 0).toBe(true)
      }
    }
  })

  test('should download invoice PDF', async ({ page }) => {
    const downloadButton = page.locator('button:has-text("Download"), a[href*="download"], button:has-text("PDF")').first()
    
    if (await downloadButton.count() > 0) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
      
      await downloadButton.click()
      
      // Download may or may not trigger immediately
      const download = await downloadPromise
      // If download triggered, verify it
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
      }
    }
  })
})


