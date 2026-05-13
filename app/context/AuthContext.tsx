import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "../constants/config";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  group?: string;
  roles: string[];
}

export interface InitialAuthData {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Событие для очистки корзины при logout
export const LOGOUT_EVENT = "sibgiu_logout";

export function AuthProvider({ children, initialAuth }: { children: ReactNode; initialAuth?: InitialAuthData | null }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth?.isAuthenticated ?? false);
  const [isLoading, setIsLoading] = useState(!initialAuth); // если нет начальных данных - грузим
  const [user, setUser] = useState<UserProfile | null>(initialAuth?.user ?? null);
  const [token, setToken] = useState<string | null>(initialAuth?.accessToken ?? null);

  // Проверяем авторизацию при загрузке (только если не было начальных данных)
  useEffect(() => {
    if (initialAuth) {
      // Начальные данные уже есть от сервера, просто завершаем загрузку
      setIsLoading(false);
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Запрашиваем данные авторизации с сервера (читает из HTTP-only куки)
      const response = await fetch("/api/check-auth", {
        credentials: "include", // Важно для отправки кук
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          // Сохраняем токен для отправки в заголовках API
          if (data.accessToken) {
            setToken(data.accessToken);
          }
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Auth check error:", e);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Используем серверный API для избежания CORS
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Ошибка авторизации" };
      }

      // ✅ ВАЛИДАЦИЯ: Авторизация успешна ТОЛЬКО если есть реальный пользователь от сервера
      if (!data.user) {
        return { success: false, error: "Неверный логин или пароль" };
      }

      const userData: UserProfile = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        fullName: data.user.fullName || data.user.username,
        group: data.user.group,
        roles: data.user.roles || ["student"],
      };

      setUser(userData);
      // Сохраняем токен в память для отправки в заголовках API
      if (data.accessToken) {
        setToken(data.accessToken);
      }
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Ошибка соединения с сервером авторизации" };
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    // Диспетчим событие для очистки корзины
    window.dispatchEvent(new Event(LOGOUT_EVENT));
    
    window.location.href = "/";
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    return user?.roles.includes(role) || false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}