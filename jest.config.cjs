/** @type {import('jest').Config} */
module.exports = {
  // Использовать jsdom для React
  testEnvironment: 'jsdom',
  
  // Корневые директории для поиска тестов
  roots: ['<rootDir>/app', '<rootDir>/tests'],
  
  // Файлы для поиска
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ],
  
  // Трансформация файлов
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Модули
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Setup файлы
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Игнорируемые директории
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],
  
  // Collect coverage
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.{ts,tsx}',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Timeout
  testTimeout: 10000,
};