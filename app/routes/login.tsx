import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "../constants/config";

export function meta() {
  return [
    { title: "Вход - Столовая СибГИУ" },
    { name: "description", content: "Вход в систему столовой СибГИУ" },
  ];
}

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Получаем код авторизации через Keycloak API
      const appUrl = window.location.origin;
      
      // Используем форму авторизации Keycloak с редиректом
      const authUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth` +
        `?client_id=${KEYCLOAK_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(appUrl + "/auth/callback")}` +
        `&response_type=code` +
        `&scope=openid` +
        `&login_hint=${encodeURIComponent(username)}`;
      
      window.location.href = authUrl;
    } catch (err) {
      setError("Ошибка входа. Проверьте логин и пароль.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#0099FF] to-[#00AAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Кнопка назад */}
        <a href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> На главную
        </a>

        {/* Карточка входа */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">С</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Вход в систему</h1>
            <p className="text-gray-500 mt-2">Авторизуйтесь через аккаунт СибГИУ</p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Форма входа */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Логин ( студенческий билет )
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите логин"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052A3] disabled:bg-gray-300 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Войти
                </>
              )}
            </button>
          </form>

          {/* Подсказка */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Используйте учётные данные от личного кабинета студента</p>
          </div>
        </div>

        {/* Информация внизу */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>Столовая СибГИУ © 2026</p>
        </div>
      </div>
    </div>
  );
}
