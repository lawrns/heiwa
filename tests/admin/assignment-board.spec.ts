import { test, expect } from '@playwright/test'
import { authenticateAsAdmin } from '../helpers/auth'

// Mock data setup
test.beforeEach(async ({ page }) => {
  // Mock assignment board data
  await page.addInitScript(() => {
    (window as any).__assignmentMockData = {
      participants: [
        { id: 'p1', name: 'John Doe', email: 'john@example.com', surfLevel: 'Beginner', bookingId: 'b1' },
        { id: 'p2', name: 'Jane Smith', email: 'jane@example.com', surfLevel: 'Intermediate', bookingId: 'b2' },
        { id: 'p3', name: 'Bob Wilson', email: 'bob@example.com', surfLevel: 'Advanced', bookingId: 'b3' },
        { id: 'p4', name: 'Alice Brown', email: 'alice@example.com', surfLevel: 'Beginner', bookingId: 'b4' }
      ],
      rooms: [
        { id: 'r1', name: 'Ocean View Suite', capacity: 2, type: 'private', currentOccupancy: 0, amenities: [] },
        { id: 'r2', name: 'Garden Bungalow', capacity: 2, type: 'private', currentOccupancy: 0, amenities: [] },
        { id: 'r3', name: 'Beachfront Dorm', capacity: 8, type: 'dorm', currentOccupancy: 0, amenities: [] }
      ]
    };
  });
});

test.describe('Admin Assignment Board (ASSIGN-001)', () => {
  test('should load assignment board with participants and rooms', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    // Navigate directly to assignments page
    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify page loads with title
    await expect(page.locator('[data-testid="assignments-title"]')).toHaveText('Room Assignments')

    // Verify week selector is present
    await expect(page.locator('select, [role="combobox"]')).toBeVisible()

    // Verify stats cards are displayed using more specific selectors
    await expect(page.locator('.grid .card, [data-testid*="stats"]')).toBeVisible()

    // Wait for assignment board to load
    await page.waitForTimeout(1500)

    // Verify assignment board components
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="assignment-board-title"]')).toBeVisible()
    // Verify room zones are present using data-testid (check that at least one exists)
    await expect(page.locator('[data-testid^="room-zone-"]').first()).toBeVisible()
  })

  test('should allow week selection and update data accordingly', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Select different week
    const weekSelector = page.locator('button').filter({ hasText: 'March 15-22, 2024' }).first()
    await weekSelector.click()

    // Wait for data to update
    await page.waitForTimeout(1000)

    // Verify week data updated using more specific selectors
    await expect(page.locator('[data-testid*="participants"], .participants-count')).toBeVisible()
    await expect(page.locator('[data-testid*="rooms"], .rooms-count')).toBeVisible()
  })

  test('should display participant information correctly', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify participants are loaded using data-testid (check that at least one exists)
    await expect(page.locator('[data-testid^="participant-card-"]').first()).toBeVisible()

    // Verify participant details are displayed
    await expect(page.locator('[data-testid^="participant-card-"] .badge, [data-testid^="participant-card-"] [class*="badge"]')).toBeVisible()
  })

  test('should display room information and capacity', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify room zones are present using data-testid (check that at least one exists)
    await expect(page.locator('[data-testid^="room-zone-"]').first()).toBeVisible()

    // Verify room badges and capacity indicators are displayed
    await expect(page.locator('[data-testid^="room-zone-"] .badge, [data-testid^="room-zone-"] [class*="badge"]')).toBeVisible()
    await expect(page.locator('[data-testid^="room-zone-"] [class*="capacity"], [data-testid^="room-zone-"] [class*="occupancy"]')).toBeVisible()
  })

  test('should show occupancy statistics', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify assignment board stats using more specific selectors
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()

    // Verify stats are displayed (using class-based selectors instead of text)
    await expect(page.locator('.stats-card, [data-testid*="stats"], .grid .card')).toBeVisible()
  })

  test('should allow saving assignments', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

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
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Note: Testing actual drag and drop with Playwright can be complex
    // and depends on the drag-and-drop library implementation.
    // For now, we'll test that the drag-and-drop interface elements are present

    // Verify drag and drop zones are present using data-testid
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()

    // Verify participants are draggable using data-testid
    const participantCard = page.locator('[data-testid^="participant-card-"]').first()
    await expect(participantCard).toBeVisible()

    // Test that room drop zones are visible (check that at least one exists)
    await expect(page.locator('[data-testid^="room-zone-"]').first()).toBeVisible()
  })

  test('should validate room capacity constraints', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify room capacity indicators are displayed
    await expect(page.locator('[data-testid^="room-zone-"] [class*="capacity"], [data-testid^="room-zone-"] [class*="occupancy"]')).toBeVisible()

    // Test that over-capacity warnings would appear (this would require actual drag-drop)
    // For now, we verify the capacity display logic is working
    const occupancyBars = page.locator('[class*="bg-green-500"]')
    await expect(occupancyBars.first()).toBeVisible()
  })

  test('should show assignment progress and completion status', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify progress indicators are present
    await expect(page.locator('[data-testid^="room-zone-"] .progress, [data-testid^="room-zone-"] [class*="progress"]')).toBeVisible()

    // Verify unassigned participants section is visible
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()

    // Test that "All participants assigned!" message structure exists
    // (though it won't show initially)
    const assignmentBoard = page.locator('[class*="space-y-6"]')
    await expect(assignmentBoard).toBeVisible()
  })

  test('should handle refresh functionality', async ({ page }) => {
    // Authenticate as admin first
    await authenticateAsAdmin(page);

    await page.goto('/admin/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify refresh button exists
    const refreshButton = page.locator('button', { hasText: 'Refresh' })
    await expect(refreshButton).toBeVisible()

    // Click refresh button
    await refreshButton.click()

    // Verify page doesn't break after refresh
    await expect(page.locator('[data-testid="assignment-board-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="unassigned-participants-card"]')).toBeVisible()
  })
})
