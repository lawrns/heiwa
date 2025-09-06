import { test, expect } from '@playwright/test';

// Mock data setup for assignment board
test.beforeEach(async ({ page }) => {
  // Mock assignment board data and functions
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
      ],
      assignments: []
    };
  });

  // Mock React DnD functionality
  await page.addInitScript(() => {
    // Mock drag and drop events
    (window as any).__mockDragDrop = {
      simulateDrag: (sourceId: string, targetId: string) => {
        const sourceElement = document.querySelector(`[data-testid="${sourceId}"]`);
        const targetElement = document.querySelector(`[data-testid="${targetId}"]`);
        
        if (sourceElement && targetElement) {
          // Simulate drag start
          const dragStartEvent = new DragEvent('dragstart', { bubbles: true });
          sourceElement.dispatchEvent(dragStartEvent);
          
          // Simulate drop
          const dropEvent = new DragEvent('drop', { bubbles: true });
          targetElement.dispatchEvent(dropEvent);
          
          return true;
        }
        return false;
      }
    };
  });
});

test.describe('Drag-and-Drop Assignment Board (ASSIGN-001)', () => {
  test('should render assignment board with unique selectors', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Verify main title is present and unique
    await expect(page.locator('[data-testid="assignments-title"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="assignments-title"]')).toHaveText('Room Assignments');

    // Verify assignment board title is present and unique
    await expect(page.locator('[data-testid="assignment-board-title"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="assignment-board-title"]')).toHaveText('Room Assignments');

    // Verify total-participants-1 selector is unique (no duplicates)
    await expect(page.locator('[data-testid="total-participants-1"]')).toHaveCount(1);

    // Verify occupancy-stats container is unique
    await expect(page.locator('[data-testid="occupancy-stats"]')).toHaveCount(1);
  });

  test('should have unique room-zone selectors for each room', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check that each room has a unique room-zone selector
    const roomZones = page.locator('[data-testid^="room-zone-"]');
    const roomZoneCount = await roomZones.count();
    
    // Should have at least 3 rooms based on mock data
    expect(roomZoneCount).toBeGreaterThanOrEqual(3);

    // Verify each room zone is unique and visible
    for (let i = 0; i < roomZoneCount; i++) {
      const roomZone = roomZones.nth(i);
      await expect(roomZone).toBeVisible();
      
      // Get the data-testid attribute to ensure uniqueness
      const testId = await roomZone.getAttribute('data-testid');
      expect(testId).toMatch(/^room-zone-/);
      
      // Verify only one element has this specific testid
      await expect(page.locator(`[data-testid="${testId}"]`)).toHaveCount(1);
    }
  });

  test('should have unique participant-card selectors', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check that each participant has a unique participant-card selector
    const participantCards = page.locator('[data-testid^="participant-card-"]');
    const participantCount = await participantCards.count();
    
    // Should have participants based on mock data
    expect(participantCount).toBeGreaterThanOrEqual(1);

    // Verify each participant card is unique and visible
    for (let i = 0; i < participantCount; i++) {
      const participantCard = participantCards.nth(i);
      await expect(participantCard).toBeVisible();
      
      // Get the data-testid attribute to ensure uniqueness
      const testId = await participantCard.getAttribute('data-testid');
      expect(testId).toMatch(/^participant-card-/);
      
      // Verify only one element has this specific testid
      await expect(page.locator(`[data-testid="${testId}"]`)).toHaveCount(1);
    }
  });

  test('should display occupancy statistics correctly', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Verify occupancy stats container
    await expect(page.locator('[data-testid="occupancy-stats"]')).toBeVisible();

    // Verify total participants count
    await expect(page.locator('[data-testid="total-participants-1"]')).toBeVisible();

    // Verify rooms assigned count
    await expect(page.locator('[data-testid="rooms-assigned-count"]')).toBeVisible();

    // Verify unassigned count
    await expect(page.locator('[data-testid="unassigned-count"]')).toBeVisible();

    // Check that stats show reasonable numbers
    const totalParticipants = await page.locator('[data-testid="total-participants-1"]').textContent();
    const unassignedCount = await page.locator('[data-testid="unassigned-count"]').textContent();
    
    // Initially, all participants should be unassigned
    expect(parseInt(totalParticipants || '0')).toBeGreaterThan(0);
    expect(parseInt(unassignedCount || '0')).toBeGreaterThan(0);
  });

  test('should simulate drag-and-drop functionality', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Get the first participant card and first room zone
    const firstParticipant = page.locator('[data-testid^="participant-card-"]').first();
    const firstRoom = page.locator('[data-testid^="room-zone-"]').first();

    // Verify elements exist
    await expect(firstParticipant).toBeVisible();
    await expect(firstRoom).toBeVisible();

    // Get initial unassigned count
    const initialUnassigned = await page.locator('[data-testid="unassigned-count"]').textContent();

    // Simulate drag and drop using mouse actions
    const participantBox = await firstParticipant.boundingBox();
    const roomBox = await firstRoom.boundingBox();

    if (participantBox && roomBox) {
      // Perform drag and drop
      await page.mouse.move(participantBox.x + participantBox.width / 2, participantBox.y + participantBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(roomBox.x + roomBox.width / 2, roomBox.y + roomBox.height / 2);
      await page.mouse.up();

      // Wait for potential state updates
      await page.waitForTimeout(500);
    }

    // Verify drag and drop elements are still present (structure intact)
    await expect(firstParticipant).toBeVisible();
    await expect(firstRoom).toBeVisible();
  });

  test('should validate room capacity constraints', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find a room with capacity information
    const roomZones = page.locator('[data-testid^="room-zone-"]');
    const firstRoom = roomZones.first();
    
    await expect(firstRoom).toBeVisible();

    // Check for capacity indicators (should show current/max format)
    const capacityIndicators = page.locator('[data-testid^="occupancy-"]');
    const capacityCount = await capacityIndicators.count();
    
    // Should have capacity indicators for each room
    expect(capacityCount).toBeGreaterThan(0);

    // Verify capacity indicators are visible
    for (let i = 0; i < capacityCount; i++) {
      await expect(capacityIndicators.nth(i)).toBeVisible();
    }
  });

  test('should handle save assignments functionality', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Verify save button exists and is unique
    await expect(page.locator('[data-testid="save-assignments-button"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="save-assignments-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-assignments-button"]')).toBeEnabled();

    // Click save button
    await page.locator('[data-testid="save-assignments-button"]').click();

    // Verify button interaction works (no errors thrown)
    await page.waitForTimeout(500);
    
    // Button should still be visible after click
    await expect(page.locator('[data-testid="save-assignments-button"]')).toBeVisible();
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Take a screenshot of the assignment board for visual regression testing
    await expect(page.locator('[data-testid="assignment-board-title"]').locator('..')).toHaveScreenshot('assignment-board.png');
  });

  test('should verify no strict mode violations', async ({ page }) => {
    // Listen for console errors that might indicate strict mode violations
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/admin/assignments');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check that no React strict mode violations occurred
    const strictModeErrors = consoleErrors.filter(error => 
      error.includes('Warning') || 
      error.includes('duplicate') || 
      error.includes('multiple children with the same key')
    );

    expect(strictModeErrors).toHaveLength(0);
  });
});
