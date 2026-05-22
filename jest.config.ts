import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  projects: [
    {
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      displayName: 'jsdom',
      preset: 'ts-jest',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['**/__tests__/**/*.test.tsx'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
  clearMocks: false,
  resetMocks: false,
  testTimeout: 10000,
}

export default config