const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  // Use jsdom environment for integration tests
  testEnvironment: 'jest-environment-jsdom',
  
  // Setup file for integration tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@emma/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@emma/ui$': '<rootDir>/../../packages/ui/src',
    '^@emma/config$': '<rootDir>/../../packages/config/src',
  },
  
  // Integration test patterns
  testMatch: [
    '**/__tests__/**/*.integration.(test|spec).(ts|tsx|js)',
    '**/*.integration.(test|spec).(ts|tsx|js)',
  ],
  
  // Coverage for integration tests
  collectCoverageFrom: [
    'src/app/api/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  
  // Longer timeout for integration tests
  testTimeout: 30000,
  
  // Global setup for database if needed
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',
};

module.exports = createJestConfig(config);
