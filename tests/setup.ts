// Jest setup файл
import '@testing-library/jest-dom';

// Мок для React Router
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn(),
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/' }),
}));

// Мок для контекстов
jest.mock('../app/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    hasRole: () => false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../app/context/CartContext', () => ({
  useCart: () => ({
    items: [],
    addItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
    total: 0,
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Мок для sonner (toast)
jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: jest.fn(),
}));

// Мок для Prisma
jest.mock('../app/lib/db.server', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  },
}));

// Глобальный таймер для тестов
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});