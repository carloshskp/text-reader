/** @type {import('jest').Config} */
module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.jest.json',
        useESM: false,
        diagnostics: {
          ignoreCodes: [151002]
        }
      }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  collectCoverageFrom: [
    'src/app/textReaderApp.ts',
    'src/speech/**/*.ts'
  ],
  coverageThreshold: {
    'src/speech/createSpeechEngine.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/speech/nativeSpeechEngine.ts': {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/speech/unsupportedSpeechEngine.ts': {
      branches: 95,
      functions: 85,
      lines: 95,
      statements: 95
    }
  }
};
