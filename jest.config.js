module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/src/**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};