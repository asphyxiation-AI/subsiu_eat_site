import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../constants/config";

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
      const savedAuth = localStorage.getItem("sibgiu_auth");
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        // Проверяем, не истёк ли токен (24 часа)
        if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          setUser(authData.user);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          localStorage.removeItem("sibgiu_auth");
        }
      }
    } catch (e) {
      console.error("Auth check error:", e);
      localStorage.removeItem("sibgiu_auth");
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

      // Сохраняем в localStorage
      const authData = { 
        user: userData, 
        timestamp: Date.now(),
        accessToken: data.accessToken 
      };
      localStorage.setItem("sibgiu_auth", JSON.stringify(authData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Ошибка соединения с сервером авторизации" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sibgiu_auth");
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
