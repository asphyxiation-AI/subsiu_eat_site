import { ShoppingCart, User, Menu, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, hasRole, logout } = useAuth();
  const navigate = useNavigate();

  // Проверка роли admin через AuthContext
  const isAdmin = hasRole("admin");

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0066CC] via-[#0099FF] to-[#00AAFF] shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Левая часть - логотип и название */}
          <div className="flex items-center gap-3">
            <a href="https://www.sibsiu.ru/" target="_blank" rel="noopener noreferrer" className="no-underline">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                <img src="/logo_sibsiu.png" alt="Логотип СибГИУ" className="w-full h-full object-contain" />
              </div>
            </a>
            <Link to="/" className="text-lg md:text-xl font-bold text-white drop-shadow-lg no-underline hover:text-white/90 transition-colors">
              Столовая СибГИУ
            </Link>
          </div>

          {/* Центр - навигация (десктоп) */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate("/#menu")}
              className="text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md hover:scale-105 bg-transparent border-none cursor-pointer"
            >
              Меню
            </button>
            <button
              onClick={() => navigate("/#about")}
              className="text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md hover:scale-105 bg-transparent border-none cursor-pointer"
            >
              О нас
            </button>
            <button
              onClick={() => navigate("/#contacts")}
              className="text-white/90 hover:text-white transition-all duration-200 font-medium drop-shadow-md hover:scale-105 bg-transparent border-none cursor-pointer"
            >
              Контакты
            </button>
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
                onClick={() => navigate("/login")}
                className="bg-white hover:bg-gray-100 text-[#0066CC] font-medium py-2 px-4 rounded-xl cursor-pointer"
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
            <button
              onClick={() => { navigate("/#menu"); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-3 text-white/90 hover:text-white transition-all duration-200 font-medium bg-transparent border-none cursor-pointer"
            >
              Меню
            </button>
            <button
              onClick={() => { navigate("/#about"); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-3 text-white/90 hover:text-white transition-all duration-200 font-medium bg-transparent border-none cursor-pointer"
            >
              О нас
            </button>
            <button
              onClick={() => { navigate("/#contacts"); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-3 text-white/90 hover:text-white transition-all duration-200 font-medium bg-transparent border-none cursor-pointer"
            >
              Контакты
            </button>
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
