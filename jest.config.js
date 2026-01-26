/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/components/**/__tests__/**/*.test.ts',
    '**/components/**/__tests__/**/*.test.tsx',
    '**/tests/unit/**/*.test.ts',
    '**/tests/unit/**/*.test.tsx',
    '**/tests/integration/**/*.test.ts',
    '**/tests/property/**/*.property.test.ts',
    '**/tests/property/**/*.property.test.tsx',
    '**/tests/accessibility/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        moduleResolution: 'node',
        baseUrl: '.',
        paths: {
          '@/*': ['./*'],
        },
        typeRoots: ['./node_modules/@types', './types'],
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Coverage configuration
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/api/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/tests/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    './lib/': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/utils.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Test reporters for CI
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml',
    }],
  ],
  
  // Performance
  maxWorkers: '50%',
  
  // Retry flaky tests (Jest 29+ uses 'retry' in test config)
  // retryTimes: 2,
  
  // Timeout for slow tests
  testTimeout: 30000,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
};

module.exports = config;
