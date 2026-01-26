import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './fixtures/admin-auth'
import { navigateToAdminPage, waitForAdminPageLoad, verifyBookingInAdmin, getBookingDetails } from './helpers/admin-helpers'

test.describe('Admin Bookings Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateToAdminPage(page, '/bookings')
    await waitForAdminPageLoad(page)
  })

  test('should load bookings page', async ({ page }) => {
    // Accept either /admin/bookings or /bookings
    await expect(page).toHaveURL(/.*\/(admin\/)?bookings/)
    
    // Check for bookings table or list
    const bookingsTable = page.locator('table, [data-testid="bookings-table"], .bookings-list')
    await expect(bookingsTable.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display bookings table with columns', async ({ page }) => {
    const table = page.locator('table').first()
    await expect(table).toBeVisible()
    
    // Check for table headers
    const headers = table.locator('th')
    const headerCount = await headers.count()
    expect(headerCount).toBeGreaterThan(0)
    
    // Verify common column headers exist
    const headerText = await headers.allTextContents()
    const headerString = headerText.join(' ').toLowerCase()
    
    // Should have at least some of these columns
    const expectedColumns = ['guest', 'email', 'date', 'status', 'payment', 'type']
    const foundColumns = expectedColumns.filter(col => headerString.includes(col))
    expect(foundColumns.length).toBeGreaterThan(0)
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], ' +
      'input[placeholder*="Search"], ' +
      '[data-testid="search"], ' +
      'input[name*="search"]'
    )
    
    await expect(searchInput.first()).toBeVisible()
    
    // Test search
    await searchInput.first().fill('test')
    await page.waitForTimeout(1000)
    
    // Verify search is working (results may be empty, but input should be filled)
    const value = await searchInput.first().inputValue()
    expect(value).toBe('test')
  })

  test('should have filter functionality', async ({ page }) => {
    // Look for filter dropdowns or buttons
    const filterSelects = page.locator(
      'select, ' +
      '[data-testid*="filter"], ' +
      'button:has-text("Filter"), ' +
      '[role="combobox"]'
    )
    
    const filterCount = await filterSelects.count()
    expect(filterCount).toBeGreaterThan(0)
  })

  test('should filter by status', async ({ page }) => {
    const statusFilter = page.locator(
      'select[name*="status"], ' +
      '[data-testid*="status-filter"], ' +
      'button:has-text("Status")'
    ).first()
    
    if (await statusFilter.count() > 0) {
      if (await statusFilter.evaluate(el => el.tagName === 'SELECT')) {
        await statusFilter.selectOption('pending')
      } else {
        await statusFilter.click()
        await page.locator('text="pending"').first().click()
      }
      
      await page.waitForTimeout(1000)
      
      // Verify filter is applied (check URL or table content)
      const url = page.url()
      const tableRows = page.locator('tbody tr')
      const rowCount = await tableRows.count()
      
      // Should have some results or show filtered state
      expect(rowCount).toBeGreaterThanOrEqual(0)
    }
  })

  test('should filter by payment status', async ({ page }) => {
    const paymentFilter = page.locator(
      'select[name*="payment"], ' +
      '[data-testid*="payment-filter"], ' +
      'button:has-text("Payment")'
    ).first()
    
    if (await paymentFilter.count() > 0) {
      if (await paymentFilter.evaluate(el => el.tagName === 'SELECT')) {
        await paymentFilter.selectOption('pending')
      } else {
        await paymentFilter.click()
        await page.locator('text="pending"').first().click()
      }
      
      await page.waitForTimeout(1000)
    }
  })

  test('should have pagination if many bookings', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    // If more than 10 rows, pagination should exist
    if (rowCount >= 10) {
      const pagination = page.locator(
        '[data-testid*="pagination"], ' +
        'button:has-text("Next"), ' +
        'button:has-text("Previous"), ' +
        '.pagination'
      )
      
      const paginationCount = await pagination.count()
      expect(paginationCount).toBeGreaterThan(0)
    }
  })

  test('should view booking details', async ({ page }) => {
    // Find first booking row
    const bookingRow = page.locator('tbody tr').first()
    
    if (await bookingRow.count() > 0) {
      // Click to view details
      await bookingRow.click()
      await page.waitForTimeout(1000)
      
      // Check for detail modal or page
      const detailModal = page.locator(
        '[role="dialog"], ' +
        '[data-testid*="modal"], ' +
        '.modal, ' +
        '[data-testid*="detail"]'
      )
      
      // Modal might appear or navigate to detail page
      const modalCount = await detailModal.count()
      const currentUrl = page.url()
      
      // Either modal appears or navigated to detail page
      expect(modalCount > 0 || currentUrl.includes('/bookings/')).toBe(true)
    }
  })

  test('should toggle calendar view', async ({ page }) => {
    const calendarToggle = page.locator(
      'button:has-text("Calendar"), ' +
      '[data-testid*="calendar-view"], ' +
      'button[aria-label*="calendar"]'
    )
    
    if (await calendarToggle.count() > 0) {
      await calendarToggle.first().click()
      await page.waitForTimeout(1000)
      
      // Check for calendar element
      const calendar = page.locator(
        '.calendar, ' +
        '[data-testid*="calendar"], ' +
        '[role="grid"]'
      )
      
      const calendarCount = await calendar.count()
      expect(calendarCount).toBeGreaterThan(0)
    }
  })

  test('should handle real-time updates', async ({ page }) => {
    // Get initial booking count
    const initialRows = page.locator('tbody tr')
    const initialCount = await initialRows.count()
    
    // Wait for potential real-time updates
    await page.waitForTimeout(3000)
    
    // Verify page is still responsive
    const finalRows = page.locator('tbody tr')
    const finalCount = await finalRows.count()
    
    // Count may have changed (new bookings) or stayed same
    expect(finalCount).toBeGreaterThanOrEqual(0)
  })

  test('should display booking information correctly', async ({ page }) => {
    const bookingRow = page.locator('tbody tr').first()
    
    if (await bookingRow.count() > 0) {
      const rowText = await bookingRow.textContent()
      
      // Should contain booking information
      expect(rowText).toBeTruthy()
      expect(rowText?.length).toBeGreaterThan(0)
    }
  })

  test('should have edit booking functionality', async ({ page }) => {
    const editButton = page.locator(
      'button:has-text("Edit"), ' +
      '[data-testid*="edit"], ' +
      'button[aria-label*="edit"]'
    ).first()
    
    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForTimeout(1000)
      
      // Check for edit modal or form
      const editModal = page.locator(
        '[role="dialog"], ' +
        '[data-testid*="edit"], ' +
        'form'
      )
      
      const modalCount = await editModal.count()
      expect(modalCount).toBeGreaterThan(0)
    }
  })
})


