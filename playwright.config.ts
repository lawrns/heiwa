import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/unit/**', '**/utils/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  timeout: 60000, // Increased for WordPress integration tests
  outputDir: 'tests/results/',

  use: {
    baseURL: 'http://localhost:3005', // Fixed port for consistency
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    // Global test timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Core admin dashboard testing
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:3005',
      },
      testMatch: ['**/admin/**', '**/dashboard.spec.ts', '**/auth.spec.ts'],
    },
    {
      name: 'firefox-admin',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:3005',
      },
      testMatch: ['**/admin/**', '**/dashboard.spec.ts'],
    },

    // WordPress integration testing
    {
      name: 'wordpress-integration',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:8080', // WordPress instance
      },
      testMatch: ['**/wordpress-integration.spec.ts'],
      dependencies: ['setup-wordpress'],
    },

    // Cross-platform widget testing
    {
      name: 'widget-parity',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
      testMatch: ['**/widget-parity.spec.ts'],
      dependencies: ['chromium-admin', 'wordpress-integration'],
    },

    // Mobile responsive testing
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        headless: true,
      },
      testMatch: ['**/client/**', '**/booking-flow.spec.ts'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        headless: true,
      },
      testMatch: ['**/client/**'],
    },

    // Performance and accessibility testing
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
      testMatch: ['**/performance.spec.ts'],
    },

    // Setup project for WordPress environment
    {
      name: 'setup-wordpress',
      testMatch: ['**/setup/wordpress-setup.spec.ts'],
      teardown: 'cleanup-wordpress',
    },
    {
      name: 'cleanup-wordpress',
      testMatch: ['**/setup/wordpress-cleanup.spec.ts'],
    },
  ],

  expect: {
    // Visual regression testing configuration
    toMatchSnapshot: { threshold: 0.2 },
    toHaveScreenshot: {
      threshold: 0.2,
      animations: 'disabled',
      caret: 'hide',
      mode: 'css',
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    },
  },

  // Multi-server setup for comprehensive testing
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3005',
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    },
    {
      command: 'docker-compose up -d wordpress',
      url: 'http://localhost:8080',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000, // WordPress takes longer to start
    },
  ],

  // Global setup and teardown (disabled for now)
  // globalSetup: require.resolve('./tests/setup/global-setup.ts'),
  // globalTeardown: require.resolve('./tests/setup/global-teardown.ts'),
})

