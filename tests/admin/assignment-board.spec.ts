import { test, expect } from '@playwright/test'

test.describe('Admin Assignment Board', () => {
  test('should load assignment board with participants and rooms', async ({ page }) => {
    // Navigate to admin assignments
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Navigate to assignments page
    await page.locator('[data-testid="manage-clients-button"]').click()
    await page.waitForURL('/admin/clients')

    // Actually navigate to assignments (assuming we add it to sidebar)
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify page loads with title
    await expect(page.locator('[data-testid="assignments-title"]')).toHaveText('Room Assignments')

    // Verify week selector is present
    await expect(page.locator('text=Select Week')).toBeVisible()

    // Verify stats cards are displayed
    await expect(page.locator('text=Active Weeks')).toBeVisible()
    await expect(page.locator('text=Total Participants')).toBeVisible()
    await expect(page.locator('text=Rooms Available')).toBeVisible()

    // Wait for assignment board to load
    await page.waitForTimeout(1500)

    // Verify assignment board components
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="assignment-board-title"]')).toBeVisible()
    await expect(page.locator('text=Ocean View Suite')).toBeVisible()
    await expect(page.locator('text=Garden Bungalow')).toBeVisible()
    await expect(page.locator('text=Beachfront Dorm')).toBeVisible()
  })

  test('should allow week selection and update data accordingly', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Select different week
    const weekSelector = page.locator('button').filter({ hasText: 'March 15-22, 2024' }).first()
    await weekSelector.click()

    // Wait for data to update
    await page.waitForTimeout(1000)

    // Verify week data updated
    await expect(page.locator('text=8 participants')).toBeVisible()
    await expect(page.locator('text=6 rooms')).toBeVisible()
  })

  test('should display participant information correctly', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify participants are loaded
    await expect(page.locator('text=Sarah Johnson')).toBeVisible()
    await expect(page.locator('text=Marcus Rodriguez')).toBeVisible()
    await expect(page.locator('text=Emily Chen')).toBeVisible()
    await expect(page.locator('text=David Thompson')).toBeVisible()

    // Verify participant details (surf levels)
    await expect(page.locator('text=intermediate')).toBeVisible()
    await expect(page.locator('text=advanced')).toBeVisible()
    await expect(page.locator('text=beginner')).toBeVisible()
  })

  test('should display room information and capacity', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify room types and capacities
    await expect(page.locator('text=Ocean View Suite')).toBeVisible()
    await expect(page.locator('text=Garden Bungalow')).toBeVisible()
    await expect(page.locator('text=Beachfront Dorm')).toBeVisible()

    // Verify room badges (private/dorm)
    await expect(page.locator('text=private')).toBeVisible()
    await expect(page.locator('text=dorm')).toBeVisible()

    // Verify capacity indicators (0/2, 0/2, 0/8)
    await expect(page.locator('text=0/2')).toBeVisible()
    await expect(page.locator('text=0/8')).toBeVisible()
  })

  test('should show occupancy statistics', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify assignment board stats
    await expect(page.locator('text=Total Participants')).toBeVisible()
    await expect(page.locator('text=Rooms Assigned')).toBeVisible()
    await expect(page.locator('text=Unassigned')).toBeVisible()

    // Verify initial counts
    await expect(page.locator('text=4')).toBeVisible() // Total participants
    await expect(page.locator('text=0')).toBeVisible() // Rooms assigned initially
    await expect(page.locator('text=4')).toBeVisible() // Unassigned initially
  })

  test('should allow saving assignments', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify save button is present and initially enabled
    const saveButton = page.locator('[data-testid="save-assignments-button"]')
    await expect(saveButton).toBeVisible()
    await expect(saveButton).toBeEnabled()

    // Click save button
    await saveButton.click()

    // Verify saving state (button should be disabled during save)
    await expect(saveButton).toBeDisabled()

    // Wait for save to complete
    await page.waitForTimeout(1500)

    // Verify save completed
    await expect(saveButton).toBeEnabled()
  })

  test('should handle drag and drop functionality', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Note: Testing actual drag and drop with Playwright can be complex
    // and depends on the drag-and-drop library implementation.
    // For now, we'll test that the drag-and-drop interface elements are present

    // Verify drag and drop zones are present
    await expect(page.locator('text=Drop participants here')).toBeVisible()

    // Verify participants are draggable (cursor should be move)
    const participantCard = page.locator('text=Sarah Johnson').first()
    await expect(participantCard).toBeVisible()

    // Test that rooms show drop zones
    await expect(page.locator('text=Ocean View Suite')).toBeVisible()
  })

  test('should validate room capacity constraints', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify initial room capacities
    await expect(page.locator('text=0/2')).toBeVisible() // Private rooms
    await expect(page.locator('text=0/8')).toBeVisible() // Dorm

    // Test that over-capacity warnings would appear (this would require actual drag-drop)
    // For now, we verify the capacity display logic is working
    const occupancyBars = page.locator('[class*="bg-green-500"]')
    await expect(occupancyBars.first()).toBeVisible()
  })

  test('should show assignment progress and completion status', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify progress indicators are present
    await expect(page.locator('text=Occupancy')).toBeVisible()

    // Verify completion status (all participants assigned message should appear when 0 unassigned)
    const unassignedCount = page.locator('text=4') // Should be 4 initially
    await expect(unassignedCount).toBeVisible()

    // Test that "All participants assigned!" message structure exists
    // (though it won't show initially)
    const assignmentBoard = page.locator('[class*="space-y-6"]')
    await expect(assignmentBoard).toBeVisible()
  })

  test('should handle refresh functionality', async ({ page }) => {
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify refresh button exists
    const refreshButton = page.locator('button', { hasText: 'Refresh' })
    await expect(refreshButton).toBeVisible()

    // Click refresh button
    await refreshButton.click()

    // Verify page doesn't break after refresh
    await expect(page.locator('h1')).toHaveText('Room Assignments')
    await expect(page.locator('text=Unassigned Participants')).toBeVisible()
  })
})
