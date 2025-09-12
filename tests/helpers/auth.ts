// Shared authentication helper for Playwright tests

// Helper function to authenticate as admin using actual login
export async function authenticateAsAdmin(page: any) {
  // Go to login page
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill in the demo credentials
  await page.fill('[data-testid="email-input"], input[type="email"]', 'admin@heiwa.house');
  await page.fill('[data-testid="password-input"], input[type="password"]', 'admin123456');
  
  // Click sign in button
  await page.click('button[type="submit"], button:has-text("Sign In")');
  
  // Wait for redirect to admin dashboard
  await page.waitForURL('/admin', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
}
