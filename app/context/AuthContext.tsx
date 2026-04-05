import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "../constants/config";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  group?: string;
  roles: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Событие для очистки корзины при logout
export const LOGOUT_EVENT = "sibgiu_logout";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
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

      const userData: UserProfile = {
        id: data.user?.id || `user-${Date.now()}`,
        username: data.user?.username || username,
        email: data.user?.email || `${username}@sibgiu.ru`,
        firstName: data.user?.firstName || "",
        lastName: data.user?.lastName || "",
        fullName: data.user?.fullName || username,
        roles: data.user?.roles || ["student"],
      };

      // Токены теперь хранятся в HTTP-only куках на сервере
      // Здесь только сохраняем данные пользователя в память приложения
      setUser(userData);
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
