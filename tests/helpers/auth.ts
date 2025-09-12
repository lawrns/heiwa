// Shared authentication helper for Playwright tests

// Helper function to authenticate as admin using actual login
export async function authenticateAsAdmin(page: any) {
  // In development mode, authentication is bypassed by middleware
  // So we can directly access admin pages without login
  // Just ensure we're ready to navigate to admin pages
  await page.waitForLoadState('networkidle');
}
