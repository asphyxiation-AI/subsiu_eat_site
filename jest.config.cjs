/** @type {import('jest').Config} */
module.exports = {
  // jsdom имитирует окружение браузера в Node.js. 
  // Это критично для тестирования React-компонентов (рендеринг, клики).
  testEnvironment: 'jsdom',
  
  roots: ['<rootDir>/app', '<rootDir>/tests'],
  
  testMatch: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
  ],
  
  // Трансформация TypeScript кода в понятный для Jest формат через ts-jest.
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  
  // Маппинг путей для тестов
  moduleNameMapper: {
    // Поддержка alias из tsconfig, чтобы тесты понимали импорты через '@/' или '~/'
    '^@/(.*)$': '<rootDir>/app/$1',
    // Игнорирование стилей при тестах. Стили не влияют на логику, поэтому мы заменяем их «заглушкой».
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  
  // Файл расширения ожиданий (например, для добавления .toBeInTheDocument())
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],
  
  // Настройка сбора покрытия кода тестами (Code Coverage)
  // Показывает, какой процент логики сайта столовой реально протестирован.
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.{ts,tsx}',
  ],
  
  coverageDirectory: 'coverage',
  
  // Отчеты: text (в консоли), lcov/html (красивые страницы с результатами)
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Таймаут увеличен до 10с для тяжелых интеграционных тестов
  testTimeout: 10000,
};