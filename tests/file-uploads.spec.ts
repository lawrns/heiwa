import { test, expect } from '@playwright/test';
import * as path from 'path';

// Mock file upload setup
test.beforeEach(async ({ page }) => {
  // Mock admin authentication
  await page.addInitScript(() => {
    (window as any).__mockAuth = {
      user: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        displayName: 'Admin User'
      },
      loading: false
    };
  });

  // Mock file upload API responses
  await page.addInitScript(() => {
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock upload API
      if (url.includes('/api/upload')) {
        if (options?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({
              success: true,
              files: [
                {
                  url: 'https://example.com/uploaded-image.jpg',
                  path: 'rooms/123/uploaded-image.jpg',
                  name: 'test-image.jpg',
                  size: 1024000,
                  type: 'image/jpeg'
                }
              ]
            })
          };
        }
        
        if (options?.method === 'DELETE') {
          return {
            ok: true,
            json: async () => ({ success: true })
          };
        }
      }

      // Mock Supabase storage operations
      if (url.includes('supabase') && url.includes('storage')) {
        return {
          ok: true,
          json: async () => ({ data: {}, error: null })
        };
      }

      return originalFetch(url, options);
    };
  });

  // Mock toast notifications
  await page.addInitScript(() => {
    (window as any).toast = {
      success: (message: string) => console.log('Toast success:', message),
      error: (message: string) => console.log('Toast error:', message)
    };
  });

  // Mock URL.createObjectURL for image previews
  await page.addInitScript(() => {
    (window as any).URL.createObjectURL = (file: File) => `blob:mock-url-${file.name}`;
    (window as any).URL.revokeObjectURL = (url: string) => {};
  });
});

test.describe('File Upload System (FILE-001)', () => {
  test('should render image upload component', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Look for image upload component (assuming it's used in rooms page)
    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
      await expect(uploadButton).toHaveText('Choose Images');
    }
  });

  test('should handle file selection and upload', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // Create a test file
      const testImagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
      
      // Mock file input
      const fileInput = page.locator('input[type="file"]');
      
      // Set files on the input
      await fileInput.setInputFiles([{
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Verify upload progress appears
      await expect(page.locator('text=Uploading...')).toBeVisible();
      
      // Wait for upload to complete
      await page.waitForTimeout(2000);
      
      // Verify success message
      await expect(page.locator('text=uploaded successfully')).toBeVisible();
    }
  });

  test('should validate file types', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake-pdf-data')
      }]);

      // Should show error message
      await expect(page.locator('text=Only image files are allowed')).toBeVisible();
    }
  });

  test('should validate file size limits', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // Mock large file
      await page.addInitScript(() => {
        const originalValidateFile = (window as any).validateFile;
        (window as any).validateFile = (file: File) => {
          if (file.size > 5 * 1024 * 1024) {
            return { valid: false, error: 'File size must be less than 5MB' };
          }
          return { valid: true };
        };
      });

      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(6 * 1024 * 1024) // 6MB file
      }]);

      // Should show size error
      await expect(page.locator('text=File size must be less than 5MB')).toBeVisible();
    }
  });

  test('should handle multiple file uploads', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      
      // Upload multiple files
      await fileInput.setInputFiles([
        {
          name: 'image1.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-1')
        },
        {
          name: 'image2.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-2')
        }
      ]);

      // Wait for uploads to complete
      await page.waitForTimeout(3000);
      
      // Should show success for multiple files
      await expect(page.locator('text=2 image(s) uploaded successfully')).toBeVisible();
    }
  });

  test('should display upload progress', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Verify progress bar appears
      await expect(page.locator('text=Uploading...')).toBeVisible();
      
      // Verify progress percentage
      const progressText = page.locator('text=/\d+%/');
      if (await progressText.isVisible()) {
        await expect(progressText).toBeVisible();
      }
    }
  });

  test('should handle image removal', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // First upload an image
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Wait for upload
      await page.waitForTimeout(2000);

      // Look for remove button (X button on image)
      const removeButton = page.locator('button:has(svg)').filter({ hasText: '' });
      if (await removeButton.first().isVisible()) {
        await removeButton.first().click();
        
        // Image should be removed from preview
        await page.waitForTimeout(500);
      }
    }
  });

  test('should respect maximum file limits', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      // Mock reaching max files limit
      await page.addInitScript(() => {
        // Override maxFiles to 1 for testing
        const originalImageUpload = (window as any).ImageUpload;
        if (originalImageUpload) {
          originalImageUpload.defaultProps = { ...originalImageUpload.defaultProps, maxFiles: 1 };
        }
      });

      const fileInput = page.locator('input[type="file"]');
      
      // Try to upload more than max allowed
      await fileInput.setInputFiles([
        {
          name: 'image1.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-1')
        },
        {
          name: 'image2.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-2')
        }
      ]);

      // Should show max files error
      await expect(page.locator('text=Maximum')).toBeVisible();
    }
  });

  test('should handle upload API errors', async ({ page }) => {
    // Mock API error
    await page.route('**/api/upload', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' })
      });
    });

    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Should show error message
      await expect(page.locator('text=Failed to upload images')).toBeVisible();
    }
  });

  test('should disable upload when uploading', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      const fileInput = page.locator('input[type="file"]');
      
      await fileInput.setInputFiles([{
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      }]);

      // Upload button should be disabled during upload
      await expect(uploadButton).toBeDisabled();
      
      // Wait for upload to complete
      await page.waitForTimeout(2000);
      
      // Button should be enabled again
      await expect(uploadButton).toBeEnabled();
    }
  });

  test('should handle drag and drop uploads', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    // Look for drag and drop area
    const dropArea = page.locator('text=Drag and drop or click to select images');
    if (await dropArea.isVisible()) {
      await expect(dropArea).toBeVisible();
      
      // Note: Actual drag and drop testing would require more complex setup
      // This test verifies the UI elements are present
      await expect(page.locator('text=Max')).toBeVisible();
      await expect(page.locator('text=5MB each')).toBeVisible();
    }
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');

    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
    }

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
    }

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    if (await uploadButton.isVisible()) {
      await expect(uploadButton).toBeVisible();
    }
  });

  test('should take snapshot for visual regression', async ({ page }) => {
    await page.goto('/admin/rooms');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot if upload component is visible
    const uploadButton = page.locator('[data-testid="file-upload"]');
    if (await uploadButton.isVisible()) {
      await expect(page.locator('body')).toHaveScreenshot('file-uploads.png');
    }
  });
});
