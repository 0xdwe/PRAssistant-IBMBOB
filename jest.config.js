module.exports = {
<<<<<<< HEAD
  projects: [
    '<rootDir>/packages/*/jest.config.js'
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/index.ts'
=======
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
      },
    },
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/test-*.ts',
    '!packages/extension/src/webview/**',
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
<<<<<<< HEAD
      statements: 80
    }
  }
=======
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@pr-ready/shared$': '<rootDir>/packages/shared/src/index.ts',
    '^@pr-ready/cli$': '<rootDir>/packages/cli/src/index.ts',
  },
  projects: [
    {
      displayName: 'cli',
      testMatch: ['<rootDir>/packages/cli/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/packages/shared/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'extension',
      testMatch: ['<rootDir>/packages/extension/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
  ],
>>>>>>> 486204d (feat: implement PR Readiness Assistant (all 20 issues))
};

// Made with Bob
