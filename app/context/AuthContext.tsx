import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { initKeycloak, getKeycloak, getUserProfile, loginKeycloak, type UserProfile } from "../lib/auth.client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Инициализация Keycloak при загрузке приложения с использованием Promise
    initKeycloak()
      .then((keycloak) => {
        const authenticated = keycloak.authenticated || false;
        setIsAuthenticated(authenticated);

        if (authenticated) {
          const token = keycloak.token || "";
          const userProfile = getUserProfile(token);
          setUser(userProfile);
        }
        
        console.log("Keycloak initialized on port 5173");
      })
      .catch((error) => {
        console.error("Keycloak init error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = () => {
    loginKeycloak();
  };

  const logout = () => {
    const keycloak = getKeycloak();
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

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
