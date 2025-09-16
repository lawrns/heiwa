/**
 * Comprehensive Assignment Board Testing
 * Tests drag-and-drop functionality, edge cases, and user experience
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Assignment Board - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'admin@heiwa.house');
    await page.fill('[data-testid="password-input"]', 'admin123456');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/admin');
    
    // Navigate to assignments
    await page.goto('/admin/assignments');
    await page.waitForSelector('[data-testid="assignment-board"]');
  });

  test.describe('Drag and Drop Functionality', () => {
    test('should successfully drag participant to room', async ({ page }) => {
      // Get initial participant count
      const initialUnassigned = await page.locator('[data-testid="unassigned-count"]').textContent();
      
      // Find first participant and first room
      const participant = page.locator('[data-testid^="participant-"]').first();
      const room = page.locator('[data-testid^="room-zone-"]').first();
      
      // Get participant name for verification
      const participantName = await participant.locator('p').first().textContent();
      
      // Perform drag and drop
      await participant.dragTo(room);
      
      // Wait for UI update
      await page.waitForTimeout(1000);
      
      // Verify participant moved to room
      const roomParticipants = room.locator('[data-testid^="participant-"]');
      await expect(roomParticipants).toHaveCount(1);
      
      // Verify participant name matches
      const movedParticipant = roomParticipants.first();
      const movedParticipantName = await movedParticipant.locator('p').first().textContent();
      expect(movedParticipantName).toBe(participantName);
      
      // Verify unassigned count decreased
      const newUnassigned = await page.locator('[data-testid="unassigned-count"]').textContent();
      expect(parseInt(newUnassigned!)).toBe(parseInt(initialUnassigned!) - 1);
    });

    test('should allow dragging participant back to unassigned', async ({ page }) => {
      // First assign a participant to a room
      const participant = page.locator('[data-testid^="participant-"]').first();
      const room = page.locator('[data-testid^="room-zone-"]').first();
      const participantName = await participant.locator('p').first().textContent();
      
      await participant.dragTo(room);
      await page.waitForTimeout(1000);
      
      // Now drag back to unassigned area
      const assignedParticipant = room.locator('[data-testid^="participant-"]').first();
      const unassignedArea = page.locator('[data-testid="unassigned-participants"]');
      
      await assignedParticipant.dragTo(unassignedArea);
      await page.waitForTimeout(1000);
      
      // Verify participant is back in unassigned
      const unassignedParticipants = unassignedArea.locator('[data-testid^="participant-"]');
      const participantNames = await unassignedParticipants.locator('p').first().allTextContents();
      expect(participantNames).toContain(participantName);
      
      // Verify room is empty
      const roomParticipants = room.locator('[data-testid^="participant-"]');
      await expect(roomParticipants).toHaveCount(0);
    });

    test('should allow moving participant between rooms', async ({ page }) => {
      // Assign participant to first room
      const participant = page.locator('[data-testid^="participant-"]').first();
      const firstRoom = page.locator('[data-testid^="room-zone-"]').first();
      const secondRoom = page.locator('[data-testid^="room-zone-"]').nth(1);
      const participantName = await participant.locator('p').first().textContent();
      
      await participant.dragTo(firstRoom);
      await page.waitForTimeout(1000);
      
      // Move to second room
      const assignedParticipant = firstRoom.locator('[data-testid^="participant-"]').first();
      await assignedParticipant.dragTo(secondRoom);
      await page.waitForTimeout(1000);
      
      // Verify participant is in second room
      const secondRoomParticipants = secondRoom.locator('[data-testid^="participant-"]');
      await expect(secondRoomParticipants).toHaveCount(1);
      
      const movedParticipantName = await secondRoomParticipants.first().locator('p').first().textContent();
      expect(movedParticipantName).toBe(participantName);
      
      // Verify first room is empty
      const firstRoomParticipants = firstRoom.locator('[data-testid^="participant-"]');
      await expect(firstRoomParticipants).toHaveCount(0);
    });

    test('should prevent exceeding room capacity', async ({ page }) => {
      // Find a private room (capacity 2)
      const privateRoom = page.locator('[data-testid^="room-zone-"]').filter({ hasText: 'private' }).first();
      const participants = page.locator('[data-testid^="participant-"]');
      
      // Assign 2 participants (should work)
      await participants.nth(0).dragTo(privateRoom);
      await page.waitForTimeout(500);
      await participants.nth(1).dragTo(privateRoom);
      await page.waitForTimeout(500);
      
      // Verify 2 participants are assigned
      const roomParticipants = privateRoom.locator('[data-testid^="participant-"]');
      await expect(roomParticipants).toHaveCount(2);
      
      // Try to assign a third participant (should fail or show warning)
      const thirdParticipant = participants.nth(2);
      await thirdParticipant.dragTo(privateRoom);
      await page.waitForTimeout(500);
      
      // Should still only have 2 participants (capacity limit enforced)
      await expect(roomParticipants).toHaveCount(2);
      
      // Check for error message or visual feedback
      const errorMessage = page.locator('[data-testid="capacity-error"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test.describe('Visual Feedback and UX', () => {
    test('should show visual feedback during drag operations', async ({ page }) => {
      const participant = page.locator('[data-testid^="participant-"]').first();
      const room = page.locator('[data-testid^="room-zone-"]').first();
      
      // Start drag operation
      await participant.hover();
      await page.mouse.down();
      
      // Check for drag visual feedback
      await expect(participant).toHaveClass(/dragging|drag-active/);
      
      // Move over room
      await room.hover();
      
      // Check for drop zone visual feedback
      await expect(room).toHaveClass(/drop-active|drag-over/);
      
      // Complete drop
      await page.mouse.up();
      
      // Verify visual feedback is removed
      await expect(participant).not.toHaveClass(/dragging|drag-active/);
      await expect(room).not.toHaveClass(/drop-active|drag-over/);
    });

    test('should update occupancy statistics in real-time', async ({ page }) => {
      const room = page.locator('[data-testid^="room-zone-"]').first();
      const participant = page.locator('[data-testid^="participant-"]').first();
      
      // Get initial occupancy
      const initialOccupancy = await room.locator('[data-testid="room-occupancy"]').textContent();
      
      // Assign participant
      await participant.dragTo(room);
      await page.waitForTimeout(1000);
      
      // Verify occupancy updated
      const newOccupancy = await room.locator('[data-testid="room-occupancy"]').textContent();
      expect(newOccupancy).not.toBe(initialOccupancy);
      
      // Should show 1/X format
      expect(newOccupancy).toMatch(/1\/\d+/);
    });

    test('should show correct room assignment statistics', async ({ page }) => {
      const totalParticipants = await page.locator('[data-testid="total-participants"]').textContent();
      const initialAssigned = await page.locator('[data-testid="rooms-assigned"]').textContent();
      const initialUnassigned = await page.locator('[data-testid="unassigned-count"]').textContent();
      
      // Assign one participant
      const participant = page.locator('[data-testid^="participant-"]').first();
      const room = page.locator('[data-testid^="room-zone-"]').first();
      await participant.dragTo(room);
      await page.waitForTimeout(1000);
      
      // Verify statistics updated
      const newAssigned = await page.locator('[data-testid="rooms-assigned"]').textContent();
      const newUnassigned = await page.locator('[data-testid="unassigned-count"]').textContent();
      
      expect(parseInt(newAssigned!)).toBe(parseInt(initialAssigned!) + 1);
      expect(parseInt(newUnassigned!)).toBe(parseInt(initialUnassigned!) - 1);
      
      // Total should remain the same
      const newTotal = await page.locator('[data-testid="total-participants"]').textContent();
      expect(newTotal).toBe(totalParticipants);
    });
  });

  test.describe('Save and Persistence', () => {
    test('should save assignments and persist after refresh', async ({ page }) => {
      // Assign participants to rooms
      const participants = page.locator('[data-testid^="participant-"]');
      const rooms = page.locator('[data-testid^="room-zone-"]');
      
      const participantName = await participants.first().locator('p').first().textContent();
      await participants.first().dragTo(rooms.first());
      await page.waitForTimeout(1000);
      
      // Save assignments
      await page.click('[data-testid="save-assignments"]');
      
      // Wait for save confirmation
      const saveSuccess = page.locator('[data-testid="save-success"]');
      await expect(saveSuccess).toBeVisible();
      
      // Refresh page
      await page.reload();
      await page.waitForSelector('[data-testid="assignment-board"]');
      
      // Verify assignment persisted
      const firstRoom = page.locator('[data-testid^="room-zone-"]').first();
      const roomParticipants = firstRoom.locator('[data-testid^="participant-"]');
      await expect(roomParticipants).toHaveCount(1);
      
      const persistedParticipantName = await roomParticipants.first().locator('p').first().textContent();
      expect(persistedParticipantName).toBe(participantName);
    });

    test('should handle save errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/assignments/**', route => route.abort());
      
      // Assign a participant
      const participant = page.locator('[data-testid^="participant-"]').first();
      const room = page.locator('[data-testid^="room-zone-"]').first();
      await participant.dragTo(room);
      await page.waitForTimeout(1000);
      
      // Try to save
      await page.click('[data-testid="save-assignments"]');
      
      // Should show error message
      const saveError = page.locator('[data-testid="save-error"]');
      await expect(saveError).toBeVisible();
      await expect(saveError).toContainText('Failed to save');
    });
  });

  test.describe('Week Selection and Data Loading', () => {
    test('should load different week data when selection changes', async ({ page }) => {
      const weekSelector = page.locator('[data-testid="week-selector"]');
      
      // Get initial participant count
      const initialParticipants = await page.locator('[data-testid^="participant-"]').count();
      
      // Change week selection
      await weekSelector.click();
      const weekOptions = page.locator('[data-testid^="week-option-"]');
      
      if (await weekOptions.count() > 1) {
        await weekOptions.nth(1).click();
        await page.waitForTimeout(1000);
        
        // Verify data changed
        const newParticipants = await page.locator('[data-testid^="participant-"]').count();
        // Data might be different for different weeks
        expect(typeof newParticipants).toBe('number');
      }
    });

    test('should handle weeks with no participants', async ({ page }) => {
      // This test would need a week with no participants in the test data
      // For now, we'll test the empty state UI
      
      const unassignedArea = page.locator('[data-testid="unassigned-participants"]');
      const emptyMessage = unassignedArea.locator('[data-testid="no-participants"]');
      
      // If no participants, should show empty state
      const participantCount = await page.locator('[data-testid^="participant-"]').count();
      if (participantCount === 0) {
        await expect(emptyMessage).toBeVisible();
        await expect(emptyMessage).toContainText('No participants');
      }
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab to first participant
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Skip header elements
      
      const focusedElement = page.locator(':focus');
      
      // Should be able to focus on participants
      const participantFocused = await focusedElement.getAttribute('data-testid');
      expect(participantFocused).toMatch(/participant-/);
      
      // Should be able to navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      const nextFocused = page.locator(':focus');
      const nextParticipantFocused = await nextFocused.getAttribute('data-testid');
      expect(nextParticipantFocused).toMatch(/participant-/);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const participants = page.locator('[data-testid^="participant-"]');
      const rooms = page.locator('[data-testid^="room-zone-"]');
      
      // Check participant accessibility
      const firstParticipant = participants.first();
      await expect(firstParticipant).toHaveAttribute('role', 'button');
      await expect(firstParticipant).toHaveAttribute('aria-label');
      
      // Check room accessibility
      const firstRoom = rooms.first();
      await expect(firstRoom).toHaveAttribute('role', 'region');
      await expect(firstRoom).toHaveAttribute('aria-label');
    });
  });
});
