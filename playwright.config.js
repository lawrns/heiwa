module.exports = {
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
  // webServer: {
  //   command: 'npm run start',
  //   port: 3002,
  //   reuseExistingServer: !process.env.CI,
  // },
}
