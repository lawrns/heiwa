/**
 * Jest configuration for API route tests
 * Separate config for API tests that don't need jsdom
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'node', // Use node environment for API tests
  testMatch: ['**/__tests__/api/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.api.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/api/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
