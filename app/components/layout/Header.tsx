import { ShoppingCart, User, Menu, Settings } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { loginKeycloak, getKeycloak } from "../../lib/auth.client";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, hasRole } = useAuth();

  // Проверка роли admin через Keycloak напрямую
  const keycloak = typeof window !== "undefined" ? getKeycloak() : null;
  const keycloakHasAdminRole = keycloak?.hasRealmRole("admin") || false;
  const isAdmin = hasRole("admin") || keycloakHasAdminRole;

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0066CC] via-[#0099FF] to-[#00AAFF] shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Левая часть - логотип и название */}
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
              <span className="text-white font-bold text-lg md:text-xl drop-shadow-md">С</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
              Столовая СибГИУ
            </span>
          </Link>

          {/* Центр - навигация (десктоп) */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) => 
                isActive ? "text-white font-bold drop-shadow-lg border-b-2 border-white pb-1" : 
                "text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md no-underline hover:scale-105"
              }
            >
              Меню
            </NavLink>
            <NavLink
              to="/#about"
              className={({ isActive }) => 
                isActive ? "text-white font-bold drop-shadow-lg border-b-2 border-white pb-1" : 
                "text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md no-underline hover:scale-105"
              }
            >
              О нас
            </NavLink>
            <NavLink
              to="/#contacts"
              className={({ isActive }) => 
                isActive ? "text-white font-bold drop-shadow-lg border-b-2 border-white pb-1" : 
                "text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md no-underline hover:scale-105"
              }
            >
              Контакты
            </NavLink>
          </nav>

          {/* Правая часть - кнопки */}
          <div className="flex items-center gap-3">
            {/* Кнопка админа - только для авторизованных админов */}
            {isAuthenticated && isAdmin && (
              <NavLink
                to="/admin"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] hover:from-[#FF9E00] hover:to-[#FF8C00] text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-white/50 no-underline"
                title="Панель управления"
              >
                <Settings className="w-5 h-5" />
                <span className="font-bold text-sm">Админка</span>
              </NavLink>
            )}
            
            <NavLink 
              to="/cart" 
              className={({ isActive }) => 
                isActive ? "relative p-3 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg transition-all duration-200 no-underline" : 
                "relative p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 no-underline"
              }
            >
              <ShoppingCart className="w-6 h-6 text-white drop-shadow-md" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#FF3B30] rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse shadow-lg">
                  {totalItems}
                </span>
              )}
            </NavLink>
            
            {/* Кнопка профиля */}
            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className={({ isActive }) => 
                  isActive ? "hidden md:flex items-center gap-2 p-3 rounded-2xl bg-white/30 backdrop-blur-md shadow-lg transition-all duration-200 no-underline" : 
                  "hidden md:flex items-center gap-2 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 no-underline"
                }
              >
                <User className="w-6 h-6 text-white drop-shadow-md" />
              </NavLink>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-[#0066CC] hover:bg-gray-100 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
              >
                Войти
              </button>
            )}
            
            {/* Мобильное меню */}
            <button 
              className="md:hidden p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20 backdrop-blur-md bg-[#0066CC]/50">
            <NavLink
              to="/"
              className={({ isActive }) => 
                isActive ? "block py-3 text-white font-bold border-b-2 border-white/50" : 
                "block py-3 text-white/90 hover:text-white transition-all duration-200 font-medium no-underline"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Меню
            </NavLink>
            <NavLink
              to="/#about"
              className={({ isActive }) => 
                isActive ? "block py-3 text-white font-bold border-b-2 border-white/50" : 
                "block py-3 text-white/90 hover:text-white transition-all duration-200 font-medium no-underline"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              О нас
            </NavLink>
            <NavLink
              to="/#contacts"
              className={({ isActive }) => 
                isActive ? "block py-3 text-white font-bold border-b-2 border-white/50" : 
                "block py-3 text-white/90 hover:text-white transition-all duration-200 font-medium no-underline"
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Контакты
            </NavLink>
            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/20">
              {/* Кнопка админа на мобильных */}
              {isAuthenticated && isAdmin && (
                <NavLink
                  to="/admin"
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] text-white font-bold shadow-lg no-underline"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  Админка
                </NavLink>
              )}
              
              <NavLink 
                to="/cart" 
                className={({ isActive }) => 
                  isActive ? "flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/30 backdrop-blur-md transition-all duration-200 no-underline" :
                  "flex items-center justify-center gap-2 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all duration-200 no-underline"
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Корзина</span>
                {totalItems > 0 && (
                  <span className="w-5 h-5 bg-[#FF3B30] rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </NavLink>
              
              {isAuthenticated ? (
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => 
                    isActive ? "flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/30 backdrop-blur-md transition-all duration-200 no-underline" :
                    "flex items-center justify-center gap-2 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md transition-all duration-200 no-underline"
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Личный кабинет</span>
                </NavLink>
              ) : (
                <button 
                  onClick={() => {
                    handleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white text-[#0066CC] font-bold shadow-lg"
                >
                  Войти
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
