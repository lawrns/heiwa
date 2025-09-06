const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/not-found.tsx',
    '!src/app/**/error.tsx',
    '!src/app/globals.css',
  ],
  testMatch: [
    '<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}',
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/admin/',
    '<rootDir>/tests/client/',
    '<rootDir>/tests/payment/',
    '<rootDir>/tests/accessibility/',
    '<rootDir>/tests/compliance/',
    '<rootDir>/tests/fixtures/',
    '<rootDir>/tests/results/',

    // Ignore specific Playwright test files
    '<rootDir>/tests/analytics.spec.ts',
    '<rootDir>/tests/assignment.spec.ts',
    '<rootDir>/tests/auth.spec.ts',
    '<rootDir>/tests/booking-calendar.spec.ts',
    '<rootDir>/tests/booking-flow.spec.ts',
    '<rootDir>/tests/booking-management.spec.ts',
    '<rootDir>/tests/bookings.spec.ts',
    '<rootDir>/tests/client-portal.spec.ts',
    '<rootDir>/tests/compliance.spec.ts',
    '<rootDir>/tests/dashboard.spec.ts',
    '<rootDir>/tests/email-notifications.spec.ts',
    '<rootDir>/tests/file-uploads.spec.ts',
    '<rootDir>/tests/payment-tracking.spec.ts',
    '<rootDir>/tests/payment.spec.ts',
    '<rootDir>/tests/rooms.spec.ts',
    '<rootDir>/tests/surf-camps.spec.ts',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
